var http = require('http');
var Promise=require('bluebird');
var cheerio = require('cheerio');
var url = 'http://www.imooc.com/learn/348';
var baseUrl='http://www.imooc.com/learn/';
var videoIds=[728,348,637,259,75,197,134];
// {
//     subject:'nodejs微信公众号开发实践',
//     number:22379,
//     contents:[{
//         chapterTitle:'第X章',
//         videos:[
//             {
//                 id:'小节ID',
//                 video:'小节名称'
//             }
//         ]
//     }]
// }
function getPageAsync(url){
    return new Promise(function(resolve,reject){
        console.log('正在爬取'+url);
        var ajaxData={
            watchedNumber:0,
            html:''
        };
        var numbers=new Promise(function(resolve1,reject1){
            // var vid = url.match(/[^http://www.imooc.com/learn/]\d*/);
            var headers = {
                'Accept':'application/json, text/javascript, */*; q=0.01',
                'Accept-Encoding':'gzip, deflate, sdch',
                'Accept-Language':'zh-CN,zh;q=0.8',
                'Connection':'keep-alive',
                'Cookie':'imooc_uuid=81794580-fbb4-4166-ad0c-f4484a39918e; imooc_isnew_ct=1494941077; PHPSESSID=gbgvpv9mfs9f56pnmqiknsksu5; imooc_isnew=2; cvde=592bf2efdfbc8-4; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1496052450; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1496052460; IMCDNS=0',
                'Host':'www.imooc.com',
                'Referer':url,
                'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36',
                'X-Requested-With':'XMLHttpRequest',
            }
            var options = {
                hostname: 'www.imooc.com',
                path: '/course/AjaxCourseMembers?ids='+url.match(/[^http://www.imooc.com/learn/]\d*/),
                method: 'GET',
                headers:headers
            }
            http.get(options, function(res){
                var rawData = '';
                res.on('data', function(data){
                    rawData += data;
                })
                res.on('end', function(){
                    ajaxData.watchedNumber=parseInt(JSON.parse(rawData).data[0].numbers,10);
                    resolve1(ajaxData);
                });
            }).on('error', (err) => {
                reject1(err);
            })
        });
        http.get(url, function(res) {
            var html = '';
            res.on('data', function(data) {
                html += data;
            });
            res.on('end', function() {
                // resolve(html);
                ajaxData.html=html;
                resolve(numbers); // numbers又会resolve给ajaxData
            });
        }).on('error', function(e) {
            reject(e);
            console.log('请求获取课程数据出错');
        });
    });
}

    Promise
    .all(videoIds.map(function(id){
        return getPageAsync(baseUrl+id);
    }))
    .then(function(pages){
        printCourseInfo(pages.map(function(page){
            return filterChapters(page); 
        }).sort(function(a,b){
            return a.number<b.number;
        }));
    })

function filterChapters(page) {
    var $ = cheerio.load(page.html);
    var courseData = {
        subject: $('.course-infos .hd h2').text(),
        number: page.watchedNumber,
        contents:[] // 定义空数组，在each过程中，再push
    }
    $(".chapter").each(function(index, element) {
        var chapterObj = {
            chapterTitle: $(element).find('strong').contents()
                .filter(function() {
                    return this.nodeType == 3; })
                .text().replace(/\s/g, ''),
            videos: [] // 定义空数组，在each过程中，再push
        };
        $(element).find(".video li").each(function(index, elt) {
            var id = $(elt).find('.J-media-item').attr('href').split('video/')[1];
            var video = $(elt).find('.J-media-item').contents()
                .filter(function() {
                    return this.nodeType == 3; })
                .text().replace(/\s/g, '');
            chapterObj.videos.push({
                id: id,
                video: video
            });
        });
        courseData.contents.push(chapterObj);
    });
    return courseData;
}
function printCourseInfo(coursesData) {
    coursesData.forEach(function(courseData) {
        console.log('有'+courseData.number+'人学过'+courseData.subject+'\r\n');
    });
    coursesData.forEach(function(courseData) {
        console.log('#####'+courseData.subject + '\r\n');
        courseData.contents.forEach(function(content){
            console.log(content.chapterTitle + '\r\n');
            content.videos.forEach(function(video) {
                console.log('	【' + video.id + '】' + video.video + '\r\n');
            });
        })
    });
}
