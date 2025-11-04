import React from 'react'
import { useNavigate } from 'react-router-dom'

const SelectPromoitonPage = () => {
  const navigate = useNavigate();
  return (
    <>
    <div>SelectPromoitonPage</div>
    <div>
    <button onClick={() => navigate("/upload")}>다음단계</button>
    </div>
    </>
  )
}

export default SelectPromoitonPage