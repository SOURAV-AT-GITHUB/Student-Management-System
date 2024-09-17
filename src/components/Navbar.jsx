// import React from 'react'
import './Navbar.css'
import gearIcon from '../icons/GearIcon.svg'
import humanAvatar from '../icons/human-avatar.jpg'
export default function Navbar() {
  return (
<nav className="navbar navbar-expand-md  fixed-top bg-dark p-2 px-4  pb-0 text-white">
  <div className="container-fluid">
    <p className=" fs-2 "><span className="px-3 py-2  nav-a-text">A</span> Hub</p>
    <button className="navbar-toggler bg-secondary text-white" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="offcanvas offcanvas-end " tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
      <div className="offcanvas-header bg-dark ">
        <img src={gearIcon} alt="gear" className='me-2' style={{height:"25px"}}/>
        <img src={humanAvatar} alt=" human-avatar" style={{height:"25px", borderRadius:"50%"}}/>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body bg-dark">
        <ul className="navbar-nav justify-content-evenly  flex-grow-1 pe-3 ">
        <li className="nav-item">
            <a className="nav-link" href="#">Dashboard</a>
          </li>
        <li className="nav-item">
            <a className="nav-link" href="#">Attendance</a>
          </li>
          <li className="nav-item ">
            <a className="nav-link active " aria-current="page" href="#">Manage Student</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Licenses</a>
          </li>
        </ul>
        <div className="d-none d-md-flex align-items-center px-3 gap-2 " >
          <img src={gearIcon} alt="gear" className='me-2' style={{height:"25px"}}/>
          <img src={humanAvatar} alt=" human-avatar" style={{height:"25px", borderRadius:"50%"}}/>
        </div>
      </div>
    </div>
  </div>
</nav>
  )
}
