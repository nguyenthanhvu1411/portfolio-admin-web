import os
import re

dir_path = r'c:\Luutru\developer-portfolio-pro\frontend\admin-web\src'

def replacer(match):
    full_button = match.group(0)
    
    # If title is already present, don't change
    if ' title=' in full_button:
        return full_button

    # Determine title based on icon
    if '<EditOutlined />' in full_button:
        title = "Chỉnh sửa"
    elif '<DeleteOutlined />' in full_button:
        title = "Xóa"
    elif '<StarOutlined />' in full_button:
        title = "Nổi bật"
    elif '<EyeOutlined />' in full_button:
        title = "Xem chi tiết"
    elif '<CheckCircleOutlined />' in full_button:
        title = "Đã phản hồi"
    elif '<InboxOutlined />' in full_button:
        title = "Lưu trữ"
    elif '<UnlockOutlined />' in full_button or '<LockOutlined />' in full_button:
        title = "Khóa/Mở khóa"
    elif '<KeyOutlined />' in full_button:
        title = "Đổi mật khẩu"
    elif '<SendOutlined />' in full_button:
        title = "Xuất bản"
    elif '<PlusOutlined />' in full_button and not 'Thêm' in full_button: # Some are add buttons without text
        title = "Thêm mới"
    elif '<ArrowLeftOutlined />' in full_button and not 'Quay lại' in full_button:
        title = "Quay lại"
    elif '<UploadOutlined />' in full_button and not 'Tải lên' in full_button and not '{label}' in full_button:
        title = "Tải lên"
    else:
        return full_button # Don't know what it is or it has text

    return full_button.replace('<Button ', f'<Button title="{title}" ')


def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Match `<Button ... />` or `<Button ...>...</Button>`
    # Actually, we mostly want icon buttons that don't have text. So `<Button ... />` or `<Button ...></Button>`
    # But wait, we can just replace `<Button([^>]+)/>` which handles self-closing buttons.
    # What if it's not self closing? `<Button icon={<EditOutlined />}></Button>` is possible.
    # Let's match `<Button[^>]*>` and replace inside it if it's an icon button.
    # Wait, an icon button can have text inside like `<Button icon={<PlusOutlined />}>Thêm</Button>`. We shouldn't add tooltip for those.
    # The self-closing ones `<Button ... />` are mostly icon buttons. Let's focus on self-closing ones first.
    content = re.sub(r'<Button\s+[^>]*/>', replacer, content)

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
print('Done!')
