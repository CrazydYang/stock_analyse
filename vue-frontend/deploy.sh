#!/bin/bash

# 前端部署脚本
# 用于将构建好的前端文件部署到服务器

# 设置错误时脚本退出
set -e

# 输出执行的命令
set -x

# 切换到目标目录
cd /var/www/stock_analyse/vue-frontend

# 删除旧的构建文件
rm -rf dist/

# 复制新的构建文件
cp -r /root/stock_analyse/vue-frontend/dist .

echo "前端部署完成！"