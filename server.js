var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

let sessions = {}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('方方说：含查询字符串的路径\n' + pathWithQuery)

  if(path === '/'){
    var string = fs.readFileSync('./index.html','utf-8')
    let cookies = request.headers.cookie
    
    if(cookies){
      cookies = cookies.split('; ')
      let hash={}
      for(let i= 0;i<cookies.length;i++){
        let parts = cookies[i].split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] = value 
      }
      let mySession = sessions[hash.sessionId]
      let email 
      if(mySession){
        email = mySession.sign_in_email
      }
      let users = fs.readFileSync('./db/users','utf-8')
      users = JSON.parse(users)
      let foundUser
      for(let i =0; i<users.length; i++){
        if(users[i].email === email){
          foundUser = users[i]
          break
        }
      }
      if(foundUser){
       string = string.replace('__password__', foundUser.password)
      }
    }
    else{
      string = string.replace('__password__', '不知道')
    }

    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }
  else if(path ==='/sign_up' && method === 'GET'){
    var string = fs.readFileSync('./sign_up.html','utf-8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }
  else if(path ==='/sign_up' && method === 'POST'){
    let body = []
    request.on('data',(chunk)=>{
      body.push(chunk)
    }).on('end',()=>{
      body = Buffer.concat(body).toString()
      let strings = body.split('&')
      let hash= {}
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key]= decodeURIComponent(value)
      })    
      let {email,password,password_confirmation}=hash

      if(email.indexOf('@') === -1){
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json; charset=utf-8' )
        response.write(`{"errors": {"email":"invalid"}}`)
      }
      else if(password!== password_confirmation){
        response.write('password not match')
      }
      else{
        let users= fs.readFileSync('./db/users','utf-8')
        try{
          users = JSON.parse(users)
        }
        catch(exception){
          users=[]
        }

        let inUse =false
        for(let i=0;i<users.length;i++){
          let user = users[i]
          if(user.email === email){
            inUse =true
            break;
          }
        }
        if(inUse){
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json; charset=utf-8' )
          response.write(`{"errors": {"email":"inuse"}}`)
        }
        else{
          users.push({email:email,password:password})
          let usersString = JSON.stringify(users)
          fs.writeFileSync('./db/users',usersString)
          response.statusCode = 200
        }
      }
      response.end()
    })
  }
  else if(path === '/sign_in' && method ==='GET'){
    var string = fs.readFileSync('./sign_in.html','utf-8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end() 
  }

  else if(path === '/sign_in' && method ==='POST'){
    let body = []
    request.on('data',(chunk)=>{
      body.push(chunk)
    }).on('end',()=>{
      body = Buffer.concat(body).toString()
      let strings = body.split('&')
      let hash= {}
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key]= decodeURIComponent(value)
      })    
      let {email,password}=hash

      if(email.indexOf('@') === -1){
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json; charset=utf-8' )
        response.write(`{"errors": {"email":"invalid"}}`)
        response.end() 
      }  
      else{
        let users= fs.readFileSync('./db/users','utf-8')
        try{
          users = JSON.parse(users)
        }
        catch(exception){
          users=[]
        }
        let found
        for(let i=0;i<users.length;i++){
          if(users[i].email === email && users[i].password === password){
            found = true
            break
          }
        }
        if(found){
          let sessionId = Math.random() * 100000
          sessions[sessionId] ={sign_in_email:email}
          response.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`)
          response.statusCode = 200
        }
        else{
          response.statusCode = 401
          response.setHeader('Content-Type', 'application/json; charset=utf-8' )
          response.write(`{"errors": {"email":"wrond"}}`)
        }
        response.end()  

      }
 
    })
  }
  
  else if(path === '/main.js'){
    var string = fs.readFileSync('./main.js','utf-8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
    response.write(string)
    response.end()
  }
  else if(path === '/style.css'){
    var string = fs.readFileSync('./style.css','utf-8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/stylesheet;charset=utf-8')
    response.write(string)
    response.end()
  }
  else if(path === '/xxx'){
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    response.write(`
      {
        "note":{
            "name":"baken",
            "age": 18,
            "height": 170,           
            "weight": 62
               }     
      }
    `
    )
    response.end()
  }  
  else{
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write('大哥您再看下，是哪粗了问题了呢~~~')
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请在空中转体720度然后用电饭煲打开 http://localhost:' + port)