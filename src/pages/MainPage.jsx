import React from 'react'
import { useNavigate } from 'react-router-dom'

const MainPage = () => {
const navigate = useNavigate();
  return (
    <>
    <div>MainPage</div>
    <div>  
    <button onClick={() => navigate("/select")}>시작하기</button>
    </div>
    </>
  )
}

export default MainPage