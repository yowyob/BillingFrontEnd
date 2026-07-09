import { METHODS } from "http";
import React from "react";

interface Props {
  properties: string[];
  dataObject: Record<string, any>; // more specific than 'any'
  method?:(data:any)=>void
}


const TableRow = ({ properties, dataObject ,method}: Props) => {
  return (
    <tr 
    onClick={()=>{method?.(dataObject)}}
    className="border-b flex justify-between border-gray-200 hover:bg-gray-200 transition-colors duration-200">
      {properties.map((prop, index) => (
        <td
          key={index}
          className="px-4 py-2 text-gray-700"
        >
          {dataObject[prop] !== undefined && dataObject[prop] !== null
            ? dataObject[prop].toString()
            : "-"}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
