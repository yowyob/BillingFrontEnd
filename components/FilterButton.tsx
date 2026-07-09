"use client"
import React, { useState } from 'react'
interface props{
    name:string,
    method:()=>void
}


const FilterButton = ({name,method}:props) => {
    let [clicked,setClicked]=useState<boolean>(false);

  return (
    <div
    onClick={()=>{
        setClicked(!clicked)
    }}
    className={clicked?'border bg-[#afb88d] border-[#afb88d] px-2 py-1 rounded text-white ':'border border-[#afb88d] hover:bg-[#afb88d] hover:text-white px-2 py-1 rounded text-[#afb88d] '}>{name}</div>
  )
}

export default FilterButton