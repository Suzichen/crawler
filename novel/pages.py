# -*- coding:UTF-8 -*-
import requests
from bs4 import BeautifulSoup

if __name__ == '__main__':
    server = 'http://www.biqukan.com/'
    # 设置url
    target = 'http://www.biqukan.com/1_1094/'
    # 获取url的内容
    req = requests.get(url = target)
    html = req.text
    # 创建BeautifulSoup对象
    bf = BeautifulSoup(html)
    # 设定条件，获取内容
    div = bf.find_all('div', class_ = 'listmain')
    a_bf = BeautifulSoup(str(div[0]))
    a = a_bf.find_all('a')
    for each in a:
        print(each.string, server + each.get('href'))