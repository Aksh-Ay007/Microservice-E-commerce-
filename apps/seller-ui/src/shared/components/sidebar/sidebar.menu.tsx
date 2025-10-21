import React from 'react'

interface Props{
  title:string;
  children:React.ReactNode;
}

const SidebarMenu = ({title,children}:Props) => {
  return (
    <div className="block mb-4">
      <h3 className='text-xs tracking-[0.04rem] pl-1 text-gray-400 uppercase font-medium mb-2'>{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export default SidebarMenu
