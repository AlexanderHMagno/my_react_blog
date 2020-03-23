import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';


const app = express();
//parse the json object that we have include with our Post Request
app.use(express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json());
const withDB = async(operations) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017',{useUnifiedTopology:true});
        const db = client.db('my-blog');
        await operations(db);
        client.close();
    } catch {
        res.status(500).json({message:"Error Connecting to db",error});
    }
}
app.get('/api/articles/:name',async (req,res)=>{
    withDB(async(db)=>{
        const upvotesCategory = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: upvotesCategory})
        res.status(200).json(articleInfo);
    })  
})
app.post('/api/articles/:name/upvotes',async (req,res) => {
    withDB(async (db)=>{
        const upvotesCategory = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: upvotesCategory})
        await db.collection('articles').updateOne({name:upvotesCategory},{'$set':{
            upvotes:articleInfo.upvotes+1
        }})
        const updatedArticleInfo = await db.collection('articles').findOne({name: upvotesCategory})
        res.status(200).json(updatedArticleInfo);
    })
})

app.post('/api/articles/:name/add-comment',async (req,res) => {
    const {username,text} = req.body;
    const upvotesCategory = req.params.name;
    withDB(async db =>{
        const articleInfo = await db.collection('articles').findOne({name: upvotesCategory})
        await db.collection('articles').updateOne({name:upvotesCategory},{'$set':{
            comments:articleInfo.comments.concat({username,text})
        }})
        const updatedArticleInfo = await db.collection('articles').findOne({name: upvotesCategory})
        res.status(200).json(updatedArticleInfo);
        
    })
})

app.get('*', (req, res)=>{
        res.sendFile(path.join(__dirname + '/build/index.html' ));
})
//Starting our server, this listen will allows to run the server on port 8000
app.listen(8000, ()=> console.log('listening on port 8000'));

