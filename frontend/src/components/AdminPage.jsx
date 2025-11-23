import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  TextField,
  Button,
  Typography,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing(8),
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  textArea: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
}));

const AdminPage = ({ token }) => {
  const classes = useStyles();
  const [host, setHost] = useState("");
  const [title, setTitle] = useState("");
  const [episode, setEpisode] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loadingEpisode, setLoadingEpisode] = useState(false);
  const [formattedTitle, setFormattedTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (title && episode && host) {
      setFormattedTitle(`${title} | The ${host} Show Episode ${episode}`);
    } else {
      setFormattedTitle("");
    }
  }, [title, episode, host]);

  useEffect(() => {
    if (!host) return;
    setLoadingEpisode(true);
    setEpisode("");
    const endpoints = {
      "Matt Walsh": "http://localhost:9000/api/titles/latest",
      "Michael Knowles": "http://localhost:9000/api/mktitles/latest",
      "Andrew Klavan": "http://localhost:9000/api/aktitles/latest",
    };
    const url = endpoints[host];
    if (!url) return;
    axios
      .get(url)
      .then((res) => {
        const nextEpisode = (res.data.latestEpisode || 0) + 1;
        setEpisode(nextEpisode);
      })
      .catch(() => setEpisode(""))
      .finally(() => setLoadingEpisode(false));
  }, [host]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!host || !title || !episode || !transcript) {
      setError("All fields are required");
      return;
    }

    const endpoints = {
      "Matt Walsh": {
        titles: "http://localhost:9000/api/titles",
        posts: "http://localhost:9000/api/posts",
      },
      "Michael Knowles": {
        titles: "http://localhost:9000/api/mktitles",
        posts: "http://localhost:9000/api/mktranscripts",
      },
      "Andrew Klavan": {
        titles: "http://localhost:9000/api/aktitles",
        posts: "http://localhost:9000/api/aktranscripts",
      },
    };

    const selectedEndpoints = endpoints[host];

    try {
      await axios.post(
        selectedEndpoints.titles,
        { title: formattedTitle, episode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await axios.post(
        selectedEndpoints.posts,
        { title: formattedTitle, episode, transcript },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTitle("");
      setTranscript("");
      setError("");
    
      // Re-fetch latest episode number for the selected host
      setLoadingEpisode(true);
      const endpointsLatest = {
        "Matt Walsh": "http://localhost:9000/api/titles/latest",
        "Michael Knowles": "http://localhost:9000/api/mktitles/latest",
        "Andrew Klavan": "http://localhost:9000/api/aktitles/latest",
      };
      const urlLatest = endpointsLatest[host];
      if (urlLatest) {
        axios
          .get(urlLatest)
          .then((res) => {
            const nextEpisode = (res.data.latestEpisode || 0) + 1;
            setEpisode(nextEpisode);
          })
          .catch(() => setEpisode(""))
          .finally(() => setLoadingEpisode(false));
      }
    } catch (err) {
      console.error("Error posting data:", err);
      setError("Error posting data");
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <div className={classes.root}>
        <Typography component="h1" variant="h5">
          Admin Page
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="host-label">Select Host</InputLabel>
            <Select
              labelId="host-label"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            >
              <MenuItem value="Matt Walsh">Matt Walsh</MenuItem>
              <MenuItem value="Michael Knowles">Michael Knowles</MenuItem>
              <MenuItem value="Andrew Klavan">Andrew Klavan</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Episode Number"
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            disabled={loadingEpisode}
            helperText={loadingEpisode ? "Loading next episode..." : ""}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="Formatted Title"
            value={formattedTitle}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            multiline
            rows={10}
            label="Transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className={classes.textArea}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Post
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default AdminPage;
