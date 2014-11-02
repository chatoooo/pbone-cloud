from bottle import route, run, template, static_file, post, get, request, response
import urllib
import urllib2
from urllib2 import HTTPError

@route('/js/<filepath:path>')
def js(filepath):
    return static_file(filepath, root='./js')
    
@route('/css/<filepath:path>')
def css(filepath):
    return static_file(filepath, root='./css')
    
@route('/fonts/<filepath:path>')
def fonts(filepath):
    return static_file(filepath, root='./fonts')

@route('/')
def index():
    return static_file('index.html', root='./views')

@post('/proxy')    
def proxy_post():
    url = request.params.get('url')
    data = request.params.get('data')
    headers = request.params.get('headers')
    
    req = urllib2.Request(url,data)
    headers = headers.split(",")
    for header in headers:
        data = request.headers.get(header)
        if data is not None:
            req.add_header(header, data)
    try:
        res = urllib2.urlopen(req)
        response.status = res.getcode()
        return res.read()
    except HTTPError, e:
        response.status = e.getcode()
        return e.read()
    
@get('/proxy')
def proxy_get():
    url = request.params.get('url')
    headers = request.params.get('headers')
    
    req = urllib2.Request(url)
    headers = headers.split(",")
    for header in headers:
        data = request.headers.get(header)
        if data is not None:
            req.add_header(header, data)
    try:
        res = urllib2.urlopen(req)
        response.status = res.getcode()
        return res.read()
    except HTTPError, e:
        response.status = e.getcode()
        return e.read()

run(port=8000)