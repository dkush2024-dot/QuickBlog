import {createContext, useContext, useEffect, useState} from 'react'
import axios from "axios";
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();

    const [token, setToken] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch all published blogs
    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/blog/all');
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                toast.error(data.message || "Failed to fetch blogs");
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to connect to server. Check VITE_BASE_URL");
        } finally {
            setLoading(false);
        }
    };

    // Initialize - Load token and fetch blogs
    useEffect(() => {
        fetchBlogs();
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, []);

    // Login user
    const loginAdmin = async (email, password) => {
        try {
            const { data } = await axios.post('/api/admin/login', { email, password });
            if (data.success) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                toast.success('Login successful');
                navigate('/admin');
                return true;
            } else {
                toast.error(data.message || "Login failed");
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login error");
            return false;
        }
    };

    // Logout user
    const logoutAdmin = () => {
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
        navigate('/');
    };

    const value = {
        axios,
        navigate,
        token,
        setToken,
        blogs,
        setBlogs,
        input,
        setInput,
        loading,
        setLoading,
        fetchBlogs,
        loginAdmin,
        logoutAdmin
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};
