//创建一个buttons
var button = document.createElement('button')
document.body.appendChild(button ) 
button.innerText = "登录"

//监听button点击事件
button.addEventListener('click',(e)=>{

    window.location.href ='/sign_in'
// let request = new XMLHttpRequest()
// request.onreadystatechange = ()=>{
//     if(request.readyState===4){
//         console.log("请求响应完毕")
//         if(request.status >= 200 && request.status < 400){
//             console.log("请求成功了")
//             console.log(request.responseText)
//             let string = request.responseText 
//             let object = window.JSON.parse(string) 
//             console.log(object.note)    
//             console.log('object.note.name')
//             console.log(object.note.name)             
//             console.log('object.note.age')
//             console.log(object.note.age)            
//             console.log('object.note.height')
//             console.log(object.note.height)
//             console.log('object.note.weight')
//             console.log(object.note.weight)    
//         }
//         else if(request.status >= 400){
//             console.log("请求失败了")
//         }
//     }
// }
// request.open('GET','/xxx')
// request.send()
})


