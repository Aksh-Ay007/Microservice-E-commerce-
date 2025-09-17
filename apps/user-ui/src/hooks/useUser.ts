import {useQuery} from '@tanstack/react-query'
import axiosInstance from '../utils/axiosinstance';



//fetch user data from API

const fetchUser=async()=>{

   const response = await axiosInstance.get("/api/logged-in-user");
   console.log(response,'user ui data from login user');


   return response.data.user
}


const useUser=()=>{

   const{

      data:user,
      isLoading,
      isError,
      refetch
   }=useQuery({

      queryKey:['user'],
      queryFn:fetchUser,
      staleTime:1000*60*5,  //store data of user for 5 min
      retry:1,
   })

   return {user,isLoading,isError,refetch}
}


export default useUser
