import React, { useContext } from "react";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Button, Container, Typography, Paper, Box } from "@mui/material";
import { ImagesContext } from "../../../contexts/images";
import { Session } from "../../../types/image";
import { TabComponentProps } from "@/types/tabs";


const getImageCorrection = (cameraModel: string) => {
  if (cameraModel === "cameraA") {
    return `apply: true
    c: 2
    f: 8.0
    k1: -9.999999747378752e-06
    camera_matrix:
      - - 2343.874030606418
        - 0
        - 1750.257150554386
      - - 0
        - 2337.355572222067
        - 987.3723075141146
      - - 0
        - 0
        - 1
    dist_coeffs:
      - - -0.45835142200388956
        - 0.45271600570178333
        - 0.0023286643488378066
        - -0.0018160985370820142
        - -0.2349399150200533`;
  }
  // Default or unknown camera model
  return `apply: false`;
}

export const FinalView: React.FC<TabComponentProps> = ({ handlePrev }) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { session, gcpPoints, distances } = context;

  // Convert distances array into dictionary { "i,j": distance }
  const distanceDict: Record<string, number> = {};
  distances.forEach((d) => {
    distanceDict[`${d.points[0]},${d.points[1]}`] = d.distance;
  });
  const imageCorrection = getImageCorrection(session.cameraModel);

  const generateYamlContent = (config: Session | null): string => {
    if (!config) {
      return "No image configuration available.";
    }

    // Round helper
    const r = (v: number) => Math.round(v);

    return `
dataset:
  image_correction:
${imageCorrection}
  gcp:
    apply: true  # do not change
    video_fp: /some/file/that/does/not/care.mp4  # do not change
    pixels:
    - - ${r(gcpPoints[0].x)}
      - ${r(gcpPoints[0].y)}
    - - ${r(gcpPoints[1].x)}
      - ${r(gcpPoints[1].y)}
    - - ${r(gcpPoints[2].x)}
      - ${r(gcpPoints[2].y)}
    - - ${r(gcpPoints[3].x)}
      - ${r(gcpPoints[3].y)}
    distances:
      "0,1": ${distanceDict["0,1"]}
      "0,2": ${distanceDict["0,2"]}
      "0,3": ${distanceDict["0,3"]}
      "1,2": ${distanceDict["1,2"]}
      "1,3": ${distanceDict["1,3"]}
      "2,3": ${distanceDict["2,3"]}
preprocessing:
  ppm: 262  # do not change
  rotate_image: ${config.rotation}
  pre_roi:
  - - ${r(config.preCrop.x1)}
    - ${r(config.preCrop.y1)}
  - - ${r(config.preCrop.x2)}
    - ${r(config.preCrop.y2)}
  roi:
  - - ${r(config.crop.x1)}
    - ${r(config.crop.y1)}
  - - ${r(config.crop.x2)}
    - ${r(config.crop.y2)}
water_flow:
  profile:
${session.depths
        .map(
          ({ x, y, depth }) =>
            `    - x: ${r(x)}\n      y: ${r(y)}\n      z: ${depth}`
        )
        .join("\n")}
`;
  };

  const colorizeYaml = (yamlString: string): React.ReactNode => {
    const lines = yamlString.split("\n");

    return lines.map((line, index) => {
      if (!line.trim()) {
        return <span key={index}>{"\n"}</span>;
      }

      const commentIndex = line.indexOf("#");
      let processedLine = <span key={index}></span>;

      if (commentIndex !== -1) {
        const codeBeforeComment = line.substring(0, commentIndex);
        const comment = line.substring(commentIndex);

        processedLine = (
          <span key={index}>
            {processKeyValuePair(codeBeforeComment)}
            <span style={{ color: "#888888" }}>{comment}</span>
            {"\n"}
          </span>
        );
      } else {
        processedLine = (
          <span key={index}>
            {processKeyValuePair(line)}
            {"\n"}
          </span>
        );
      }

      return processedLine;
    });
  };

  const processKeyValuePair = (text: string): React.ReactNode => {
    const indentMatch = text.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[0] : "";

    if (text.trim().startsWith("-")) {
      const dashIndex = text.indexOf("-");
      const afterDash = text.substring(dashIndex + 1);

      return (
        <>
          <span>{indent}</span>
          <span style={{ color: "#9932CC" }}>-</span>
          {processKeyValuePair(afterDash)}
        </>
      );
    }

    const colonIndex = text.indexOf(":");
    if (colonIndex !== -1) {
      const key = text.substring(0, colonIndex).trim();
      const value = text.substring(colonIndex + 1);

      return (
        <>
          <span>{indent}</span>
          <span style={{ color: "#2E8B57", fontWeight: "bold" }}>{key}</span>
          <span style={{ color: "#9932CC" }}>:</span>
          {value && <span style={{ color: "#0000CD" }}>{value}</span>}
        </>
      );
    }

    return <span>{text}</span>;
  };

  const yamlContent = generateYamlContent(session);
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
          maxHeight: "400px",
          overflow: "auto",
          mb: 2,
          backgroundColor: "#f5f5f5",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
        }}
      >
        <Box
          component="div"
          sx={{
            m: 0,
            p: 2,
            fontFamily: "monospace",
            fontSize: "0.875rem",
            whiteSpace: "pre",
            overflowX: "auto",
            backgroundColor: "inherit",
            userSelect: "text",
            cursor: "text",
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
