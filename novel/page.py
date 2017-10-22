# -*- coding:UTF-8 -*-
import requests
from bs4 import BeautifulSoup

if __name__ == '__main__':
    # 设置url
    target = 'http://www.biqukan.com/1_1094/5403177.html'
    # 获取url的内容
    req = requests.get(url = target)
    html = req.text
    # 创建BeautifulSoup对象
    bf = BeautifulSoup(html)
    # 设定条件，获取内容
    texts = bf.find_all('div', class_ = 'showtxt')
    result = texts[0].text  # 剔除标签
    # 正则替换8个空格符为回车
    result = result.replace('\xa0'*8, '\n\n')
    print(result)