// Database service layer for ReTodoku
// Provides CRUD operations for users, postcard templates, and NFC postcards

export interface User {
  id: number;
  name: string;
  handle: string;
  platform: 'twitter' | 'telegram' | 'email' | 'other';
  slug: string; // platform-handle格式，用于用户主页URL
  created_at: string;
  updated_at: string;
  // avatar_url将通过getAvatarUrl函数动态生成
}

export interface PostcardTemplate {
  id: number;
  template_id: string; // 英文+字符格式的唯一标识符
  name: string;
  image_url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface NFCPostcard {
  id: number;
  postcard_hash: string; // MD5编码的唯一标识符，用于NFC tag URL
  sender_id?: number; // 可为空，匿名发送
  recipient_id?: number; // 可为空，未激活时为空
  template_id: number;
  message?: string; // 明信片上的文字内容
  custom_image_url?: string; // 自定义图片URL（可选，覆盖模板图片）
  is_activated: boolean; // 是否已被激活
  activated_at?: string; // 激活时间
  created_at: string;
  updated_at: string;
  // Joined fields
  sender?: User;
  recipient?: User;
  template?: PostcardTemplate;
}

export interface MeetupPhoto {
  id: number;
  postcard_id: number; // 关联到nfc_postcards表
  photo_url: string;
  caption?: string;
  uploaded_at: string;
}

// Helper function to generate avatar URL using unavatar service
export function getAvatarUrl(platform: string, handle: string): string {
  switch (platform) {
    case 'twitter':
      return `https://unavatar.io/x/${handle}`;
    case 'telegram':
      return `https://unavatar.io/telegram/${handle}`;
    case 'email':
      return `https://unavatar.io/${handle}`;
    default:
      return `https://unavatar.io/${handle}`;
  }
}

// Helper function to generate slug from platform and handle
export function generateSlug(platform: string, handle: string): string {
  return `${platform}-${handle}`;
}

// Helper function to generate MD5 hash for postcard
export function generatePostcardHash(): string {
  // Generate a random MD5-like hash (32 characters)
  return Math.random().toString(36).substr(2, 32).padEnd(32, '0');
}

export class DatabaseService {
  constructor(private db: D1Database) {}

  // User operations
  async getUsers(): Promise<User[]> {
    const { results } = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    return results as unknown as User[];
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    return result as User | null;
  }

  async getUserBySlug(slug: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE slug = ?').bind(slug).first();
    return result as User | null;
  }

  async getUserByHandle(handle: string, platform: string): Promise<User | null> {
    const result = await this.db.prepare('SELECT * FROM users WHERE handle = ? AND platform = ?')
      .bind(handle, platform).first();
    return result as User | null;
  }

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'slug'>): Promise<User> {
    const slug = generateSlug(user.platform, user.handle);
    const { success, meta } = await this.db.prepare(`
      INSERT INTO users (name, handle, platform, slug)
      VALUES (?, ?, ?, ?)
    `).bind(user.name, user.handle, user.platform, slug).run();

    if (!success) throw new Error('Failed to create user');
    
    const newUser = await this.getUserById(meta.last_row_id);
    if (!newUser) throw new Error('Failed to retrieve created user');
    
    return newUser;
  }

  // Postcard template operations
  async getPostcardTemplates(): Promise<PostcardTemplate[]> {
    const { results } = await this.db.prepare('SELECT * FROM postcard_templates WHERE is_active = 1 ORDER BY created_at DESC').all();
    return results as unknown as PostcardTemplate[];
  }

  async getPostcardTemplateById(id: number): Promise<PostcardTemplate | null> {
    const result = await this.db.prepare('SELECT * FROM postcard_templates WHERE id = ?').bind(id).first();
    return result as PostcardTemplate | null;
  }

  async getPostcardTemplateByTemplateId(templateId: string): Promise<PostcardTemplate | null> {
    const result = await this.db.prepare('SELECT * FROM postcard_templates WHERE template_id = ?').bind(templateId).first();
    return result as PostcardTemplate | null;
  }

  // NFC postcard operations
  async getNFCPostcards(): Promise<NFCPostcard[]> {
    const { results } = await this.db.prepare(`
      SELECT 
        np.*,
        s.name as sender_name, s.handle as sender_handle, s.platform as sender_platform, s.slug as sender_slug,
        r.name as recipient_name, r.handle as recipient_handle, r.platform as recipient_platform, r.slug as recipient_slug,
        pt.template_id as template_template_id, pt.name as template_name, pt.image_url as template_image_url, pt.description as template_description
      FROM nfc_postcards np
      LEFT JOIN users s ON np.sender_id = s.id
      LEFT JOIN users r ON np.recipient_id = r.id
      JOIN postcard_templates pt ON np.template_id = pt.id
      ORDER BY np.created_at DESC
    `).all();

    return results.map((row: any) => ({
      id: row.id,
      postcard_hash: row.postcard_hash,
      sender_id: row.sender_id,
      recipient_id: row.recipient_id,
      template_id: row.template_id,
      message: row.message,
      custom_image_url: row.custom_image_url,
      is_activated: row.is_activated,
      activated_at: row.activated_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sender: row.sender_id ? {
        id: row.sender_id,
        name: row.sender_name,
        handle: row.sender_handle,
        platform: row.sender_platform,
        slug: row.sender_slug,
        created_at: '',
        updated_at: ''
      } : undefined,
      recipient: row.recipient_id ? {
        id: row.recipient_id,
        name: row.recipient_name,
        handle: row.recipient_handle,
        platform: row.recipient_platform,
        slug: row.recipient_slug,
        created_at: '',
        updated_at: ''
      } : undefined,
      template: {
        id: row.template_id,
        template_id: row.template_template_id,
        name: row.template_name,
        image_url: row.template_image_url,
        description: row.template_description,
        is_active: true,
        created_at: ''
      }
    })) as NFCPostcard[];
  }

  async getNFCPostcardByHash(hash: string): Promise<NFCPostcard | null> {
    const { results } = await this.db.prepare(`
      SELECT 
        np.*,
        s.name as sender_name, s.handle as sender_handle, s.platform as sender_platform, s.slug as sender_slug,
        r.name as recipient_name, r.handle as recipient_handle, r.platform as recipient_platform, r.slug as recipient_slug,
        pt.template_id as template_template_id, pt.name as template_name, pt.image_url as template_image_url, pt.description as template_description
      FROM nfc_postcards np
      LEFT JOIN users s ON np.sender_id = s.id
      LEFT JOIN users r ON np.recipient_id = r.id
      JOIN postcard_templates pt ON np.template_id = pt.id
      WHERE np.postcard_hash = ?
    `).bind(hash).all();

    if (results.length === 0) return null;

    const row = results[0] as any;
    return {
      id: row.id,
      postcard_hash: row.postcard_hash,
      sender_id: row.sender_id,
      recipient_id: row.recipient_id,
      template_id: row.template_id,
      message: row.message,
      custom_image_url: row.custom_image_url,
      is_activated: row.is_activated,
      activated_at: row.activated_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sender: row.sender_id ? {
        id: row.sender_id,
        name: row.sender_name,
        handle: row.sender_handle,
        platform: row.sender_platform,
        slug: row.sender_slug,
        created_at: '',
        updated_at: ''
      } : undefined,
      recipient: row.recipient_id ? {
        id: row.recipient_id,
        name: row.recipient_name,
        handle: row.recipient_handle,
        platform: row.recipient_platform,
        slug: row.recipient_slug,
        created_at: '',
        updated_at: ''
      } : undefined,
      template: {
        id: row.template_id,
        template_id: row.template_template_id,
        name: row.template_name,
        image_url: row.template_image_url,
        description: row.template_description,
        is_active: true,
        created_at: ''
      }
    };
  }

  async getNFCPostcardsByRecipient(recipientId: number): Promise<NFCPostcard[]> {
    const { results } = await this.db.prepare(`
      SELECT 
        np.*,
        s.name as sender_name, s.handle as sender_handle, s.platform as sender_platform, s.slug as sender_slug,
        pt.template_id as template_template_id, pt.name as template_name, pt.image_url as template_image_url, pt.description as template_description
      FROM nfc_postcards np
      LEFT JOIN users s ON np.sender_id = s.id
      JOIN postcard_templates pt ON np.template_id = pt.id
      WHERE np.recipient_id = ? AND np.is_activated = TRUE
      ORDER BY np.activated_at DESC
    `).bind(recipientId).all();

    return results.map((row: any) => ({
      id: row.id,
      postcard_hash: row.postcard_hash,
      sender_id: row.sender_id,
      recipient_id: row.recipient_id,
      template_id: row.template_id,
      message: row.message,
      custom_image_url: row.custom_image_url,
      is_activated: row.is_activated,
      activated_at: row.activated_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sender: row.sender_id ? {
        id: row.sender_id,
        name: row.sender_name,
        handle: row.sender_handle,
        platform: row.sender_platform,
        slug: row.sender_slug,
        created_at: '',
        updated_at: ''
      } : undefined,
      template: {
        id: row.template_id,
        template_id: row.template_template_id,
        name: row.template_name,
        image_url: row.template_image_url,
        description: row.template_description,
        is_active: true,
        created_at: ''
      }
    })) as NFCPostcard[];
  }

  async createNFCPostcard(postcard: Omit<NFCPostcard, 'id' | 'created_at' | 'updated_at' | 'sender' | 'recipient' | 'template' | 'postcard_hash'>): Promise<NFCPostcard> {
    const hash = generatePostcardHash();
    const { success } = await this.db.prepare(`
      INSERT INTO nfc_postcards (postcard_hash, sender_id, recipient_id, template_id, message, custom_image_url, is_activated, activated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      hash,
      postcard.sender_id || null,
      postcard.recipient_id || null,
      postcard.template_id,
      postcard.message || null,
      postcard.custom_image_url || null,
      postcard.is_activated || false,
      postcard.activated_at || null
    ).run();

    if (!success) throw new Error('Failed to create NFC postcard');
    
    const newPostcard = await this.getNFCPostcardByHash(hash);
    if (!newPostcard) throw new Error('Failed to retrieve created postcard');
    
    return newPostcard;
  }

  async activateNFCPostcard(hash: string, recipientId: number): Promise<void> {
    const { success } = await this.db.prepare(`
      UPDATE nfc_postcards 
      SET recipient_id = ?, is_activated = TRUE, activated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE postcard_hash = ? AND is_activated = FALSE
    `).bind(recipientId, hash).run();

    if (!success) throw new Error('Failed to activate NFC postcard');
  }

  // Meetup photo operations
  async getMeetupPhotosByPostcardId(postcardId: number): Promise<MeetupPhoto[]> {
    const { results } = await this.db.prepare('SELECT * FROM meetup_photos WHERE postcard_id = ? ORDER BY uploaded_at DESC')
      .bind(postcardId).all();
    return results as unknown as MeetupPhoto[];
  }

  async createMeetupPhoto(photo: Omit<MeetupPhoto, 'id' | 'uploaded_at'>): Promise<MeetupPhoto> {
    const { success, meta } = await this.db.prepare(`
      INSERT INTO meetup_photos (postcard_id, photo_url, caption)
      VALUES (?, ?, ?)
    `).bind(photo.postcard_id, photo.photo_url, photo.caption || null).run();

    if (!success) throw new Error('Failed to create meetup photo');
    
    const result = await this.db.prepare('SELECT * FROM meetup_photos WHERE id = ?').bind(meta.last_row_id).first();
    if (!result) throw new Error('Failed to retrieve created photo');
    
    return result as unknown as MeetupPhoto;
  }

  async deleteNFCPostcard(id: number): Promise<void> {
    const { success } = await this.db.prepare(`
      DELETE FROM nfc_postcards WHERE id = ?
    `).bind(id).run();

    if (!success) throw new Error('Failed to delete NFC postcard');
  }
} 