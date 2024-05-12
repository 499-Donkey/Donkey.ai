import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Script } from '../models/script';
import "../styles/scripts.css";

const Scripts: React.FC = () => {
    const [scripts, setScripts] = useState<Script[]>([]); 
    useEffect(() => {
        async function loadScripts() {
            try {
                const response = await fetch("/api/scripts", { method: "GET" });
                const scripts = await response.json();
                setScripts(scripts);
            } catch (error) {
                console.error(error);
                alert(error);
            }
        }
        loadScripts();
    }, []);

    return (
        <div className="contain">
            <h1>
                Data about scripts
            </h1>

            <ul>
                {scripts.map((script) => ( // Corrected variable name to script (lowercase)
                    <li key={script._id}>
                        <p>{script.title}</p>
                        <p>{script.text}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Scripts;
