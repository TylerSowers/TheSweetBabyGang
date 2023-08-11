import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, TextField, Box, IconButton, Grid } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@material-ui/icons';
import axios from 'axios';

const TranscriptCard = () => {
  const [transcript, setTranscript] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/posts');
        const sortedTranscript = response.data.sort((a, b) => a.episode - b.episode);
        setTranscript(sortedTranscript);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); 
  };

  const highlightText = (text) => {
    const regex = new RegExp(searchQuery, 'gi');
    return text.replace(regex, (match) => `<span style="background-color: yellow">${match}</span>`);
  };

  const toggleCardExpansion = (cardId) => {
    if (cardId === expandedCardId) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(cardId);
    }
  };

  const filteredTranscripts = transcript.filter((transcriptItem) =>
    transcriptItem.transcript.includes(searchQuery)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTranscripts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredTranscripts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <Box display="flex" justifyContent="center" marginBottom={2}>
        <TextField label="Search Transcript" value={searchQuery} onChange={handleSearchChange} />
      </Box>
      <Grid container spacing={2}>
        {currentItems.map((transcriptItem) => (
          <Grid item xs={12} sm={6} key={transcriptItem._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" component="h2">
                    {transcriptItem.title}
                  </Typography>
                  <IconButton onClick={() => toggleCardExpansion(transcriptItem._id)}>
                    {expandedCardId === transcriptItem._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Episode: {transcriptItem.episode}
                </Typography>
                {expandedCardId === transcriptItem._id && (
                  <Typography
                    variant="body2"
                    component="p"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(transcriptItem.transcript),
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" marginTop={2}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <button key={pageNumber} onClick={() => handlePageChange(pageNumber)}>
            {pageNumber}
          </button>
        ))}
      </Box>
    </div>
  );
};

export default TranscriptCard;