import express from 'express'
import {customAlphabet} from 'nanoid'
import pineconeClient, {openai as openaiClient} from '../pinecone.mjs'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
const pcIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME)
let router = express.Router()



router.post('/post', async (req, res, next) => {
    if (
        !req.body.title
        || !req.body.text
    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
        return;
    }
try {
const response = await openaiClient.embeddings.create({
    model: "text-embedding-ada-002",
    input: `${req.body.title} ${req.body.text}`})
const vector = response?.data[0]?.embedding
console.log("vector",vector)


const upsertResponse = await pcIndex.upsert([{
    id: nanoid(),
    values: vector,
    metadata: {
        title: req.body.title,
        text: req.body.text,
        createdOn: new Date()
    }
}])
console.log("upsertResponse",upsertResponse)
res.send("Post created")

}catch(e){
    console.error(e);
}
})

router.get('/posts', async (req, res, next) => {
try{
    const response = await openaiClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: "",
    });
    const vector = response?.data[0]?.embedding
    console.log("vector: ", vector);
    // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

    const queryResponse = await pcIndex.query({
        vector: vector,
        // id: "vec1",
        topK: 10000,
        includeValues: false,
        includeMetadata: true
    });

    queryResponse.matches.map(eachMatch => {
        console.log(`score ${eachMatch.score.toFixed(1)} => ${JSON.stringify(eachMatch.metadata)}\n\n`);
    })
    console.log(`${queryResponse.matches.length} records found `);

    const formattedOutput = queryResponse.matches.map(eachMatch => ({
        text: eachMatch?.metadata?.text,
        title: eachMatch?.metadata?.title,
        _id: eachMatch?.id,
    }))

    res.send(formattedOutput);
}catch(e){
    console.error(e)
}
 
  }) 

  router.get('/search',async (req, res) => {
try{
const response = await openaiClient.embeddings.create({
    model: "text-embedding-ada-002",
    input: req.query.q
})
const vector = response?.data[0]?.embedding
console.log("vector", vector)  

const queryResponse = await pcIndex.query({
    vector: vector,
    topK: 20,
    includeValues: false,
    includeMetadata: true
});
queryResponse.matches.map(eachMatch => {
    console.log(`score ${eachMatch.score.toFixed(3)} => ${JSON.stringify(eachMatch.metadata)}\n\n`);
})
console.log(`${queryResponse.matches.length} records found `);

const formattedOutput = queryResponse.matches.map(eachMatch => ({
    text: eachMatch?.metadata?.text,
    title: eachMatch?.metadata?.title,
    _id: eachMatch?.id,
}))

res.send(formattedOutput);

}catch(e){
    console.error(e)
}

  })
//   router.put('/post/:postId', async (req, res, next) => {
   
//   });
// router.delete('/post/:postId', async (req, res, next) => {
 
// });


  export default router