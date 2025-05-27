import { Route, Routes } from "react-router-dom";
// import { useEffect } from "react";
// import { useAtom } from "jotai";
// import { userAtom } from "./atoms";
import { 
    LobbyPage, 
    RoomPage, 
    MainLayout, 
    NotFoundPage, 
    HomePage
  } from "./pages";
import {  HomeRoute, LobbyRoute, RoomDetailRoute } from "./routeConstants"; 

export default function ApplicationRoutes() {
  
  return (
    <>
      
      <Routes>
        <Route path={HomeRoute} element={<HomePage />} />
        <Route element={<MainLayout />}>
          <Route path={LobbyRoute} element={<LobbyPage />} />
          <Route path={RoomDetailRoute} element={<RoomPage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}