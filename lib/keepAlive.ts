function keepAlive() {
  const url = process.env.RENDER_URL || "https://your-app.onrender.com/api/ping"

  setInterval(async () => {
    try {
      await fetch(url)
      console.log("Keep-alive ping sent ✅")
    } catch (err) {
      console.error("Keep-alive failed ❌", err)
    }
  }, 14 * 60 * 1000) // every 14 minutes
}

export default keepAlive
