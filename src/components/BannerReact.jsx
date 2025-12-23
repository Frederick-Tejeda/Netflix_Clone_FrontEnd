import { useState, useEffect } from "react";
import "../styles/Banner.css"

const THE_MOVIE_DB_API_KEY = import.meta.env.PUBLIC_THE_MOVIE_DB_API_KEY;
const PUBLIC_SERVER_URL = import.meta.env.PUBLIC_SERVER_URL;

export default function BannerReact() {

    const [movie, setMovie] = useState(null);
    const [truncated, setTruncated] = useState("");
    const [idUser, setIdUser] = useState("");
    const [idProfile, setIdProfile] = useState("");
    const [token, setToken] = useState("");

    const truncate = (str, n) => str?.length > n ? str.substr(0, n - 1) + "..." : str;

    useEffect(() => {
        const storedIdUser = sessionStorage.getItem('idUser') || localStorage.getItem('idUser');
        const storedIdProfile = sessionStorage.getItem('idProfile') || localStorage.getItem('idProfile');
        const storedToken = localStorage.getItem("token");
        setIdUser(storedIdUser);
        setIdProfile(storedIdProfile);
        setToken(storedToken);
        fetch('https://api.themoviedb.org/3/trending/all/week?language=en-US', 
            {
            method: 'GET',
                headers:  {
                accept: 'application/json',
                Authorization: THE_MOVIE_DB_API_KEY
            }})
            .then((response) => response.json())
            .then((res) => {
                setMovie(res.results[Math.floor(Math.random() * res.results.length - 1)])
                setTruncated(truncate(movie?.overview, 150))
            })
    }, []);

    const updateProfile = async (change, id) => {
        let caughtError;
        await fetch(`${PUBLIC_SERVER_URL}/users/${idUser}/${idProfile}?change=${change}&id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    return [true, data.message];
                } else {
                    return [false, data.message];
                }
            }).catch((error) => {
                // console.error('Error:', error);
                caughtError = error;
            });
        if(caughtError == undefined) return [true, "success"];
        return [false, "Something went wrong, try again later..."]
    }

    const navigateToPlayer = (title, isMovie, release_date) => {
        window.location.href = `/PlayMedia?title=${title}&isMovie=${isMovie}&release_date=${release_date}`;
    }

    const PlayMedia = async () => {
        const media_type = (movie.first_air_date) ? "tv" : "movie";
        const result = await updateProfile(media_type, movie.id)
        if(result[0]){
            navigateToPlayer(movie?.title || movie?.name || movie?.original_name, (media_type == "movie") ? true : false, movie?.release_date || movie?.first_air_date)
        }else{
            alert(result[1])
        }
    }

    const AddMyList = async () => {
        const result = await updateProfile("WishList", movie.id)
        if(result[0]){
            alert("Added ✅")
        }else{
            alert(result[1])
        }
    }

    return(
        <>
            <header className="banner"
                style={{
                backgroundSize: "cover",
                backgroundImage: `url(
                "https://image.tmdb.org/t/p/original/${movie?.backdrop_path}"
                )`,
                backgroundPosition: "center center"
                }}
            >
                <div className="banner_contents">
                <h1 className="banner_title">
                    {movie?.title || movie?.name || movie?.original_name}
                </h1>

                <div className="banner_buttons">
                    <a onClick={PlayMedia}><button className="banner_button play_button"><img src="./play_icon.png" alt="play_icon" /><span>Play</span></button></a>
                    <a onClick={AddMyList}><button className="banner_button"><img src="./add_icon.png" alt="add_icon" /><span>My List</span></button></a>
                </div>
                <h1 className="banner_description">{truncated}</h1>
                </div>
            </header>
        </>
    )
}