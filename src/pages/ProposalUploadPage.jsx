import React from 'react'
import { useNavigate } from 'react-router-dom'

const ProposalUploadPage = () => {
  const navigate = useNavigate();
  return (
    <>
    <div>ProposalUploadPage</div>
    <div>
    <button onClick={() => navigate("/analyze")}>분석 시작하기</button>
    </div>
    </>
  )
}

export default ProposalUploadPage