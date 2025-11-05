
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header';

const MainPage = () => {
const navigate = useNavigate();
  return (
    <>
    <Header/>
    <div className='flex justify-center mt-30'>
    <div>MainPage</div>
    <div className='flex '>  
    <button onClick={() => navigate("/select")}>시작하기</button>
    </div>
    </div>
    </>
  )
}

export default MainPage