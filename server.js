const http = require('http')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Post = require('./models/post')

dotenv.config({path: './.env'})

mongoose
.connect(process.env.DATABASE)
.then(() => console.log('資料庫連接成功'))

const requestListener = async(req, res)=>{
  let body = ''
  req.on('data', chunk => {
    body += chunk
  })
  const headers = {
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
	}

  if (req.url === '/posts' && req.method === 'GET') {
    const posts = await Post.find()
    res.writeHead(200, headers)
    res.write(JSON.stringify({
      status: 'success',
      data: posts
    }))
    res.end()
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const newPost = await Post.create({
          content: data.content,
          name: data.name
        })
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: 'success',
          data: newPost
        }))
        res.end()
      } catch (error) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: 'failed',
          message: error
        }))
        res.end()
      }
    })
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    await Post.deleteMany({})
    res.writeHead(204, headers)
    res.end()
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    const id = req.url.split('/')[2]
    await Post.findByIdAndDelete(id)
    res.writeHead(204, headers)
    res.end()
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    const id = req.url.split('/')[2]
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        await Post.findByIdAndUpdate(id, data)
        const updatePost = await Post.find({ _id: id })
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: 'success',
          data: updatePost
        }))
        res.end()
      } catch (error) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: 'failed',
          message: error
        }))
        res.end()
      }
    })
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: 'failed',
      message: '404 Not Found'
    }))
    res.end()
  }
}
const server = http.createServer(requestListener)
server.listen(8001)