'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react'

interface SideBarProps {
    content: string;
    Icon: React.ElementType;
    DropDown?: React.ElementType; // Made optional with ?
    path: string;
}

const SideBarComponent = ({ content, Icon, DropDown, path }: SideBarProps) => {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    
    // Check if current path matches the link path for active styling
    const isActive = pathname === path;

    return (
        <Link href={path} className="block w-full">
            <div 
                className={`
                    flex justify-between items-center px-4 py-2.5 my-1
                    rounded-lg transition-all duration-200 group cursor-pointer
                    ${isActive 
                        ? 'bg-[var(--color-secondary-mid)] text-white shadow-sm' 
                        : 'text-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)] hover:bg-opacity-40'
                    }
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className='flex items-center gap-3'>
                    <Icon 
                        fontSize="small" 
                        className={`transition-colors ${isActive ? 'text-white' : 'opacity-70 group-hover:opacity-100'}`} 
                    />
                    <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                        {content}
                    </span>
                </div>

                {DropDown && (
                    <div className={`transition-transform duration-300 ${isHovered ? "rotate-180" : ""}`}>
                        <DropDown fontSize="small" className="opacity-50" />
                    </div>
                )}
            </div>
        </Link>
    )
}

export default SideBarComponent;