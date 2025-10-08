import React, { useContext } from "react";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Button, Container, Typography, Paper, Box } from "@mui/material";
import { ImagesContext } from "../../../contexts/images";
import { ImageConfig } from "../../../types/image";
import { TabComponentProps } from "@/types/tabs";

export const FinalView: React.FC<TabComponentProps> = ({ handlePrev }) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imageConfig } = context;

  const generateYamlContent = (config: ImageConfig | null): string => {
    if (!config) {
      return "No image configuration available.";
    }

    return `
dataset:
  gcp:
    apply: true  # do not change
    pixels:
    - - 596
      - 422
    - - 916
      - 234
    - - 3380
      - 1160
    - - 2657
      - 2077
    video_fp: /some/file/that/does/not/care.mp4  # do not change
    distances:
      "0,1": 32
      "0,2": 32
      "0,3": 32
      "1,2": 32
      "1,3": 32
      "2,3": 32
preprocessing:
  ppm: 262  # do not change
  rotate_image: 250
  pre_roi:
  roi:
`;
  // - - ${config.preCrop?.x || 0}
  //   - ${config.preCrop?.y || 0}
  // - - ${config.preCrop?.width || 0}
  //   - ${config.preCrop?.height || 0}
  };
  // - - ${config.cropArea?.x || 0}
  //   - ${config.cropArea?.y || 0}
  // - - ${config.cropArea?.width || 0}
  //   - ${config.cropArea?.height || 0}

  const colorizeYaml = (yamlString: string): React.ReactNode => {
    // Split the YAML string into lines to process each line individually
    const lines = yamlString.split('\n');

    return lines.map((line, index) => {
      // Check if the line is empty
      if (!line.trim()) {
        return <span key={index}>{'\n'}</span>;
      }

      // Check for comments
      const commentIndex = line.indexOf('#');
      let processedLine = <span key={index}></span>;

      if (commentIndex !== -1) {
        // Line has a comment
        const codeBeforeComment = line.substring(0, commentIndex);
        const comment = line.substring(commentIndex);

        processedLine = (
          <span key={index}>
            {processKeyValuePair(codeBeforeComment)}
            <span style={{ color: '#888888' }}>{comment}</span>
            {'\n'}
          </span>
        );
      } else {
        // Process key-value pairs
        processedLine = (
          <span key={index}>
            {processKeyValuePair(line)}
            {'\n'}
          </span>
        );
      }

      return processedLine;
    });
  };

  const processKeyValuePair = (text: string): React.ReactNode => {
    // Process indentation
    const indentMatch = text.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[0] : '';

    // Check for list items (lines starting with -)
    if (text.trim().startsWith('-')) {
      const dashIndex = text.indexOf('-');
      const afterDash = text.substring(dashIndex + 1);

      return (
        <>
          <span>{indent}</span>
          <span style={{ color: '#9932CC' }}>-</span>
          {processKeyValuePair(afterDash)}
        </>
      );
    }

    // Check for key-value pairs
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1) {
      const key = text.substring(0, colonIndex).trim();
      const value = text.substring(colonIndex + 1);

      return (
        <>
          <span>{indent}</span>
          <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>{key}</span>
          <span style={{ color: '#9932CC' }}>:</span>
          {value && <span style={{ color: '#0000CD' }}>{value}</span>}
        </>
      );
    }

    // If no special case matches, return the text as is
    return <span>{text}</span>;
  };

  const yamlContent = generateYamlContent(imageConfig);
  const colorizedYaml = colorizeYaml(yamlContent);

  const downloadYaml = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.yaml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <ImageControls
        rotation={0}
        onRotationChange={null}
        onRotate90={null}
        onPrevious={handlePrev}
        onNext={null}
      />
      <Typography variant="h6" gutterBottom>
        Configuration Preview:
      </Typography>
      <Paper
        elevation={3}
        sx={{
          maxHeight: '400px',
          overflow: 'auto',
          mb: 2,
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: '4px'
        }}
      >
        <Box
          component="div"
          sx={{
            m: 0,
            p: 2,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre',
            overflowX: 'auto',
            backgroundColor: 'inherit',
            userSelect: 'text',
            cursor: 'text'
          }}
        >
          {colorizedYaml}
        </Box>
      </Paper>
      <Button variant="contained" color="primary" onClick={downloadYaml}>
        Download YAML
      </Button>
    </Container>
  );
};
