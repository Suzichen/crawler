var http = require('http');
var cheerio = require('cheerio');
var url = 'http://www.imooc.com/learn/348';
http.get(url, function(res) {
    var html = '';
    res.on('data', function(data) {
        html += data;
    });
    res.on('end', function() {
        // console.log(html);
        var courseData = filterChapters(html);
        printCourseInfo(courseData);
    });
}).on('error', function() {
    console.log('请求获取课程数据出错');
});

function filterChapters(html) {
    var $ = cheerio.load(html);
    var courseData = []; // 定义空数组，在each过程中，再push
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
        courseData.push(chapterObj);
    });
    return courseData;
}


function printCourseInfo(courseData) {
    courseData.forEach(function(chapter) {
        console.log(chapter.chapterTitle + '\r\n');
        chapter.videos.forEach(function(video) {
            console.log('	【' + video.id + '】' + video.video + '\r\n');
        });
    });
}
