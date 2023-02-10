import Head from "next/head";
import { useState,useRef } from "react";
import styles from "./index.module.css";

function debounce(fn,wait){
  let timeout = null;
  return function(){
     if(timeout !== null) clearTimeout(timeout);
     timeout = setTimeout(fn,wait);
  }
}

function throttle(func,delay){
  let prev = Date.now();
  return function(){
     let context = this;
     let args = arguments;
     let now = Date.now();
     if(now - prev >= delay){
        func.apply(context,args);
        prev = Date.now();
     }
  }
}

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [inputDisabled, setInputDispabled] = useState(false);
  const [result, setResult] = useState();
  const [searchHistory,setSearchHistory]=useState([])
  const inputSubmit=useRef()
  async function onSubmit(event) {
    event.preventDefault();
    setInputDispabled(true)

    if (animalInput.trim().length === 0) {
      alert('Please enter a valid article')
      setInputDispabled(false)
      return;
    }
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          animal:animalInput,
          config:{
            model: "text-davinci-003",
            prompt:`Summarize this article into bullet points:
                    Article: ${animalInput}
                    Summary:`,
            temperature: 0,
            max_tokens: 60,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
          }
        })
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setSearchHistory([{
        title:animalInput,
        content:data.result
      },...searchHistory])
      setAnimalInput("");
      setInputDispabled(false)
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
      setAnimalInput("");
      setInputDispabled(false)
    }
  }

  return (
    <div>
      <Head>
        <title>ChatGPT Playground</title>
        <link rel="icon" href="/bosch.png" />
      </Head>
      <div style={{
            width: '100%',
            height: '20px',
            backgroundColor:'skyblue',
            backgroundImage: `url('./topbar.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: '50%',
            marginBottom:'10px'
        }}></div>
      <img src="/bosch.png" className={styles.icon} style={{width:'200px'}} />
      <main className={styles.main}>
        
        <h3>ChatGPT Playground</h3>

        <div style={{fontWeight:'bold',fontSize:'25px',marginBottom:'20px'}}>Bosch China Digital Community</div>
        <div style={{position:'fixed',bottom:'80px'}}>快来吧奔腾电脑,就让它们代替我来思考 - New Boy (朴树,1999)</div>
        <div style={{position:'fixed',bottom:'50px'}}>Developed by <a href="mailto:he.sun@cn.bosch.com">SUN He (ATMO-3CN/PJ-CDT)</a></div>
        {/* <h3>ChatGPT Market Sniffer</h3> */}
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name=""
            placeholder="Enter your question"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" disabled={inputDisabled} value="Answer" />
        </form>
        {/* <div className={styles.result}>{result}</div> */}
        <div >
          {
            searchHistory.map((h,index)=>(
              <div key={index} className={styles.card}>
                <div className={styles.result}>{h.title}</div>
                <div className={styles.result}>{h.content}</div>
              </div>
            ))
          }
        </div>
      </main>
    </div>
  );
}
