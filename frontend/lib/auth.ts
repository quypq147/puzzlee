import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";



export async function getCurrentUser() {
    try{
        const supabase = createClient();
        const {data: {user}} = await supabase.auth.getUser();
        return user;
    }
    catch(err){
        console.log("Lỗi lấy nguời dùng:", err);
        return null;
    }
}

export async function isLoggedIn()
{
    const user =  await getCurrentUser();
    if(user == null)
    {
        redirect('/login');
    }
    return user;
}

export async function isAdmin()
{
    const user = await isLoggedIn();
    const supabase = createClient();
    const { data: { user: userData } } = await supabase.auth.getUser();
    if(userData?.user_metadata?.role !== 'admin')
    {
        redirect('/dashboard');
    }
    else{
        redirect('/admin');
    }
}
