"use client";

import styled from "styled-components";

export const SideBarWrapper = styled.div`
background-color:var(--background);
transition:transform 0.25 ease;
height:100%;
position:fixed;
transform:translateX(-100%);
width:16rem;
flex-shrink:0;
z-index:202;
overflow-y:auto;
border-right:1px solid var(--border);
flex-direction:column;
padding-top:var(--space-10);
padding-left var(--space-6);
padding-right:var(--space-6);

::-webkit-scrollbar{
  display:none;
}

@media(min-width:768px){

margin-left:0;
display:flex;
position:static;
height:100vh;
transform:translateX(0);
}

/* varient for collapsed*/
${(props: any) =>
  props.collapsed &&
  `

   display:inherit;
   margin-left:0;
   transform:translateX(0);

   `}


`;

//overlay components

export const Overlay = styled.div`
  background-color: rgba(15, 23, 42, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: 201;
  transition: opacity 0.3s ease;
  opacity: 0.8;

  @media (min-width: 768px) {
    display: none;
    z-index: auto;
    opacity: 1;
  }
`;

//header componet

export const Header = styled.div`
  display: flex;
  gap: var(--space-8);
  align-items: center;
  padding-left: var(--space-10);
  padding-right: var(--space-10);
`;

//body component

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  margin-top: var(--space-13);
  padding-left: var(--space-4);
  padding-right: var(--space-4);
`;

//footer component

export const Footer = styled.div`
  display: flex;
  aligh-items: center;
  justify-content: center;
  gap: var(--space-12);
  padding-left: var(--space-8);
  padding-right: var(--space-8);
  padding-bottom: var(--space-8);
  padding-top: var(--space-18);

  @media (min-width: 768px) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export const Sidebar = {
  Wrapper: SideBarWrapper,
  Header,
  Body,
  Footer,
  Overlay,
};
