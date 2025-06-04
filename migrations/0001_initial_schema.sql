-- Initial database schema for ReTodoku
-- Create tables for users, postcard templates, and NFC postcards

-- Users table for storing user information
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    handle TEXT NOT NULL,
    platform TEXT NOT NULL CHECK(platform IN ('twitter', 'telegram', 'email', 'other')),
    slug TEXT NOT NULL UNIQUE, -- platform-handle格式，用于用户主页URL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Postcard templates table for storing available postcard designs
CREATE TABLE IF NOT EXISTS postcard_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id TEXT NOT NULL UNIQUE, -- 英文+字符格式的模板ID
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- NFC postcards table for storing individual postcard instances
-- 每张物理明信片对应一个独特的NFC tag
CREATE TABLE IF NOT EXISTS nfc_postcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postcard_hash TEXT NOT NULL UNIQUE, -- MD5编码的唯一标识符，用于NFC tag URL
    sender_id INTEGER, -- 外键，关联到users表，表示发送明信片的用户（可为空，匿名发送）
    recipient_id INTEGER, -- 外键，关联到users表，表示接收明信片的用户（激活后设置）
    template_id INTEGER NOT NULL, -- 外键，关联到postcard_templates表，表示使用的明信片模板
    message TEXT, -- 明信片上的文字内容
    custom_image_url TEXT, -- 自定义图片URL（可选，覆盖模板图片）
    is_activated BOOLEAN DEFAULT FALSE, -- 是否已被激活（用户扫描并绑定）
    activated_at DATETIME, -- 激活时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES postcard_templates(id)
);

-- Meetup photos table for storing photos related to postcards
CREATE TABLE IF NOT EXISTS meetup_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postcard_id INTEGER NOT NULL, -- 关联到nfc_postcards表
    photo_url TEXT NOT NULL,
    caption TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postcard_id) REFERENCES nfc_postcards(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_platform_handle ON users(platform, handle);
CREATE INDEX IF NOT EXISTS idx_users_slug ON users(slug);
CREATE INDEX IF NOT EXISTS idx_postcard_templates_template_id ON postcard_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_nfc_postcards_hash ON nfc_postcards(postcard_hash);
CREATE INDEX IF NOT EXISTS idx_nfc_postcards_sender ON nfc_postcards(sender_id);
CREATE INDEX IF NOT EXISTS idx_nfc_postcards_recipient ON nfc_postcards(recipient_id);
CREATE INDEX IF NOT EXISTS idx_nfc_postcards_activated ON nfc_postcards(is_activated);
CREATE INDEX IF NOT EXISTS idx_meetup_photos_postcard ON meetup_photos(postcard_id); 