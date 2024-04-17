import React, { useState, FormEvent } from "react";
import styled from "styled-components";
import { Button, CircularProgress, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface VideoFormat {
  itag: number;
  url: string;
  qualityLabel: string;
}

interface VideoInfo {
  title: string;
  length: number;
  totalViews: number;
  category: string;
  thumbnail: string;
  formats: VideoFormat[];
}

const formatViews = (views: number): string => {
  if (views >= 1e9) {
    return `${(views / 1e9).toFixed(1)}B views`;
  } else if (views >= 1e6) {
    return `${(views / 1e6).toFixed(1)}M views`;
  } else if (views >= 1e3) {
    return `${(views / 1e3).toFixed(1)}K views`;
  } else {
    return `${views} views`;
  }
};

const formatVideoLength = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = hours > 0 ? `${hours}h ` : "";
  const formattedMinutes = minutes > 0 ? `${minutes}m ` : "";
  const formattedSeconds = remainingSeconds > 0 ? `${remainingSeconds}s` : "";

  return formattedHours + formattedMinutes + formattedSeconds;
};

const MainApp: React.FC = () => {
  const [ytURL, setYTURL] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASEURL}/download?url=${ytURL}`
      );
      const mainResponse: VideoInfo = await response.json();
      setVideoInfo(mainResponse);
    } catch (error) {
      console.error("Error fetching video info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainContainer>
      <SearchBox>
        <MyForm onSubmit={handleDownload}>
          <StyledTextField
            label="Enter Youtube URL"
            variant="standard"
            value={ytURL}
            onChange={(e) => setYTURL(e.target.value)}
            fullWidth
          />
          <StyledButton
            variant="contained"
            type="submit"
            disabled={isLoading}
            endIcon={
              isLoading ? <CircularProgress size="small" /> : <SearchIcon />
            }
          >
            {isLoading ? "Loading..." : "Start"}
          </StyledButton>
        </MyForm>
      </SearchBox>

      {videoInfo && (
        <VideoInfoContainer>
          <h2>Results:</h2>
          <img
            src={videoInfo.thumbnail}
            style={{
              width: "100%",
              height: "auto",
            }}
            alt="Thumbnail"
          />
          <p style={{fontWeight:"600", fontSize:"1.3rem"}} >{videoInfo.title}</p>
          <div style={{padding:"10px 0"}}>
            <p style={{fontWeight:"500"}} >Length: <span style={{opacity:.8}} >{formatVideoLength(videoInfo.length)}</span></p>
            <p style={{fontWeight:"500"}} >Total Views: <span style={{opacity:.8}} >{formatViews(videoInfo.totalViews)}</span></p>
            <p style={{fontWeight:"500"}} >Category: <span style={{opacity:.8}} >{videoInfo.category}</span></p>
          </div>
          <div className="thumbnails"></div>
          <div className="formats">
            <h3>Available Formats:</h3>
            <div style={{display:"flex", flexWrap:"wrap", gap:"5px"}} >
            {videoInfo.formats.map((format, index) => (
              <FormatContainer key={index}>
                <p>{format.qualityLabel}</p>
                {/* <p>{format.itag}</p> */}
                <a target="_blank" href={format.url} download="video.mp4">
                  <DownlodButton variant="contained">Download</DownlodButton>
                </a>
              </FormatContainer>
            ))}
            </div>
          </div>
        </VideoInfoContainer>
      )}
    </MainContainer>
  );
};

export default MainApp;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
`;
const SearchBox = styled.div`
  margin-bottom: 20px;
`;
const MyForm = styled.form`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 100%;
  }

  @media (min-width: 768px) {
    width: 50%;
  }
`;

const StyledTextField = styled(TextField)`
  width: 100%;
  margin-bottom: 10px;
`;

const StyledButton = styled(Button)`
  background-color: #007bff !important;
  color: #fff;
  padding: 10px 20px;
  &:hover {
    background-color: #0067cc !important;
  }
`;
const DownlodButton = styled(Button)`
  background-color: #0bd84e !important;
  color: #fff;
  padding: 10px 20px;
  &:hover {
    background-color: #259e4c !important;
  }
`;

const FormatContainer = styled.div`
  border:1px solid black;
  border-radius: 5px;
  width:fit-content;
  padding: 10px;
  margin-bottom: 10px;
`;
const VideoInfoContainer = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin:0 auto;
  width:50%;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
