import React from 'react'
interface props{
    fieldName:string,
    value:string
}
const Field = ({fieldName,value}:props) => {
  return (
    <div className=' flex gap-3 p-2 border rounded  hover:bg-secondary-super-light cursor-pointer shadow shadow-secondary-light border-secondary-light '>
        <div className='font-bold text-xl  text-secondary-mid'>
            {fieldName}:
        </div>
        <span>
            {value}
        </span>
    </div>
  )
}

export default Field