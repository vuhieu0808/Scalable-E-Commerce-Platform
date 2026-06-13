#!/bin/bash
set -e
set -u

function create_user_and_database() {
    # Cắt chuỗi để lấy các thông tin riêng lẻ
    local db_info=$1
    local database=$(echo "$db_info" | cut -d':' -f1)
    local username=$(echo "$db_info" | cut -d':' -f2)
    local password=$(echo "$db_info" | cut -d':' -f3)

    echo "  Đang khởi tạo Database: '$database' với User: '$username'..."
    
    # Chạy lệnh SQL bằng tài khoản siêu quản trị (POSTGRES_USER) của container
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        -- 1. Tạo User mới nếu chưa tồn tại
        CREATE USER $username WITH PASSWORD '$password';
        
        -- 2. Tạo Database mới
        CREATE DATABASE $database;
        
        -- 3. Cấp toàn quyền quản lý database này cho user vừa tạo
        GRANT ALL PRIVILEGES ON DATABASE $database TO $username;
EOSQL

    # Khóa chặt quyền: Kết nối thẳng vào DB vừa tạo để thu hồi quyền của các user vãng lai khác
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$database" <<-EOSQL
        -- Thu hồi quyền của nhóm "PUBLIC" (mặc định ai cũng có quyền kết nối lúc đầu)
        REVOKE ALL ON SCHEMA public FROM PUBLIC;
        REVOKE CONNECT ON DATABASE $database FROM PUBLIC;
        
        -- Cấp lại quyền cho riêng chủ sở hữu hợp pháp
        GRANT CONNECT ON DATABASE $database TO $username;
        GRANT ALL ON SCHEMA public TO $username;
EOSQL
    echo "  --> Hoàn thành cách ly cho $database !"
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
    echo "Phát hiện yêu cầu khởi tạo nhiều database cách ly..."
    for db_entry in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database "$db_entry"
    done
    echo "Tất cả các cơ sở dữ liệu đã được khởi tạo và cách ly thành công!"
fi