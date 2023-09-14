import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import './home.css'
// const baseUrl = "http://localhost:5001";

const Home = () => {
    let postTitleInputRef = useRef(null)
    let postTextInputRef = useRef(null)
    let searchInputRef = useRef(null)
    const [toggleRefresh, setToggleRefresh] = useState(false);
let [allPosts,setAllPosts] = useState([])
const searchHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`/api/v1/search?q=${searchInputRef.current.value}`);
      console.log(response.data);

      setAllPosts([...response.data]);
    } catch (error) {
      console.log(error.data);
    }
  };
const getAllPosts = async () =>{
    try{
        const response = await axios.get(`/api/v1/posts`)
        setAllPosts([...response.data])

    }catch(e){
        console.error(e)
    }
}
useEffect(()=>{
    getAllPosts()
}, [toggleRefresh])
    const submitHandler = async(e) => {
        e.preventDefault();
        console.log('submitHandler')
        console.log("postTitleInputRef", postTitleInputRef.current.value)
        console.log("postTextInputRef", postTextInputRef.current.value)
        try{
            const response = await axios.post(`/api/v1/post`, {
                title: postTitleInputRef.current.value,
                text: postTextInputRef.current.value
            })
        setToggleRefresh(!toggleRefresh)
        } catch(e) {
            console.log(e)
        }
    }

    return (
        <div>
             <form action="" onSubmit={searchHandler} style={{textAlign: "left", marginTop:"1.5rem"} }>
        
        <label htmlFor="">Search Here:</label>
        <input type="search" placeholder="Search..." ref={searchInputRef} style={{marginLeft: "1rem", height:"1.3rem"}}/>
        <button type="submit" hidden></button>
    </form>
            <form action="" onSubmit={submitHandler} style={{marginTop: "1.5rem"}}>
                <div className="contents"><input type="text" placeholder="Post Title" required minLength={5} maxLength={30} ref={postTitleInputRef}/>
                <input type="text" placeholder="Post Text" required minLength={10} maxLength={1000} ref={postTextInputRef}/>
                <button type="submit">Publish Post</button></div>
            </form>
   
            {allPosts.map((post, index) => (
                <div key={index} className="card">
                    <h2>{post.title}</h2>
                    <p>{post.text}</p>
                </div>
            ))}
        </div>
    )
    
}

export default Home;
