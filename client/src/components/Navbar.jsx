import React, { useContext, useRef,useEffect } from 'react'
import {assets} from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/appContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {

  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = useRef(null);

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const navigate = useNavigate();
  const {userData, backend_url, setUserData, setIsLoggedIn} =useContext(AppContext)

  const sendVerificationOtp = async () => {
    try{
      axios.defaults.withCredentials = true;

      const {data} = await axios.post(backend_url + '/api/auth/send-verify-otp')

      if(data.success){
        navigate('/email-verify');
        toast.success(data.message)
      }else{
        toast.error(data.message);
        console.log(data);
      }

    }
    catch(err){
      toast.error(err.message);
    }
  }

  const logout = async ()=> {
    try{
      axios.defaults.withCredentials = true;

      const {data} = await axios.post(backend_url + '/api/auth/logout');
      if(data.success){
        setIsLoggedIn(false);
        setUserData(null);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    }
    catch(err){
      toast.error(err.message);
    }
  }



  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      <button 
        onClick={() => navigate('/')} 
        className='p-2 -m-2 cursor-pointer select-none active:opacity-70'
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        aria-label="Go to home">
        <img src={assets.logo} alt="Logo" className='w-28 sm:w-32 pointer-events-none' />
      </button>

      {userData ?
       <div ref={dropdownRef} className='w-8 h-8 flex justify-center items-center
        rounded-full bg-black text-white relative group cursor-pointer'
        onClick={() => setShowDropdown(!showDropdown)}>

      
      {userData.name[0].toUpperCase()}

       {showDropdown &&
      <div className='absolute hidden group-hover:block top-0 right-0 
         z-5 text-black rounded pt-10'>

        <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>

          {!userData.isAccountVerified &&
          <li onClick={sendVerificationOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Verify Email</li>
           }

          <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10'>Logout</li>
        </ul>
      </div>
}
        </div>
    :
      <button onClick={() => navigate('/login',{state: "Login"})} className='flex items-center gap-2 border border-gray-500
       rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100
       transition-all cursor-pointer'>Login <img src={assets.arrow_icon} alt="arrow" /></button>
  }
    </div>
  )
}
export default Navbar
