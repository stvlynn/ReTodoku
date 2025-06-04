-- Seed data for ReTodoku
-- Insert sample users, postcard templates, and NFC postcards

-- Insert sample users (avatar_url将通过unavatar服务动态生成)
-- slug格式: platform-handle，用于用户主页URL
INSERT INTO users (name, handle, platform, slug) VALUES
('Alice Chen', 'alicechen', 'twitter', 'twitter-alicechen'),
('Bob Wilson', 'bobwilson', 'telegram', 'telegram-bobwilson'),
('Carol Davis', 'carol.davis@email.com', 'email', 'email-carol.davis'),
('David Kim', 'davidkim', 'twitter', 'twitter-davidkim'),
('Emma Johnson', 'emmaj', 'telegram', 'telegram-emmaj'),
('Frank Miller', 'frank.miller@email.com', 'email', 'email-frank.miller');

-- Insert postcard templates (使用Unsplash高质量图片)
-- template_id: 英文+字符格式的唯一标识符
INSERT INTO postcard_templates (template_id, name, image_url, description) VALUES
('tokyo-skyline', 'Tokyo Skyline', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop', 'Beautiful view of Tokyo city skyline'),
('mount-fuji', 'Mount Fuji', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', 'Iconic Mount Fuji landscape'),
('cherry-blossoms', 'Cherry Blossoms', 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=600&fit=crop', 'Spring cherry blossoms in full bloom'),
('kyoto-temple', 'Kyoto Temple', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop', 'Traditional temple in Kyoto'),
('osaka-castle', 'Osaka Castle', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=600&fit=crop', 'Historic Osaka Castle'),
('shibuya-crossing', 'Shibuya Crossing', 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&h=600&fit=crop', 'Famous Shibuya crossing at night');

-- Insert NFC postcards (示例明信片)
-- postcard_hash: MD5编码的唯一标识符，用于NFC tag URL
-- 部分明信片已激活，部分未激活
INSERT INTO nfc_postcards (postcard_hash, sender_id, recipient_id, template_id, message, is_activated, activated_at, created_at) VALUES
-- 已激活的明信片
('a1b2c3d4e5f6789012345678901234ab', 1, 2, 1, 'Hope you enjoy this view of Tokyo! 🏙️', TRUE, '2024-01-20 14:20:00', '2024-01-15 10:30:00'),
('b2c3d4e5f6789012345678901234abc', 3, 1, 3, 'Cherry blossom season is here! 🌸', TRUE, '2024-01-12 18:30:00', '2024-01-10 16:45:00'),
('c3d4e5f6789012345678901234abcd', 4, 5, 5, 'Osaka Castle is magnificent! 🏯', TRUE, '2024-01-25 09:15:00', '2024-01-22 13:10:00'),
('d4e5f6789012345678901234abcde', 2, 4, 4, 'Peaceful moment at the temple 🙏', TRUE, '2024-01-14 09:45:00', '2024-01-08 11:20:00'),

-- 未激活的明信片（等待扫描激活）
('e5f6789012345678901234abcdef', 1, NULL, 2, 'Mount Fuji was amazing today! 🗻', FALSE, NULL, '2024-01-18 09:15:00'),
('f6789012345678901234abcdef0', 5, NULL, 6, 'The energy of Shibuya is incredible! ⚡', FALSE, NULL, '2024-01-05 20:30:00'),
('789012345678901234abcdef01', NULL, NULL, 1, 'Anonymous postcard from Tokyo', FALSE, NULL, '2024-01-28 15:45:00'),
('89012345678901234abcdef012', 6, NULL, 4, 'Sending peace and tranquility 🕊️', FALSE, NULL, '2024-01-30 11:30:00'); 