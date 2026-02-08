import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import Bloglist from '../components/BlogList'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'

const Home = () => {
   console.log("Render");

  return (
    <>
        <Navbar />
        <Header />
        <Bloglist />
        <Newsletter />
        <Footer />
    </>
  )
}

export default Home