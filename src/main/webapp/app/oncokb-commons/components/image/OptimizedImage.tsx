import React from 'react';
import ProgressiveImage from 'react-progressive-image';

const OptimizedImage: React.FunctionComponent<
  {
    src: string;
    progressiveLoading?: boolean;
  } & React.ImgHTMLAttributes<HTMLImageElement>
> = props => {
  const { progressiveLoading, ...rest } = props;

  const ImgElement = () => <img {...rest} style={{ imageRendering: '-webkit-optimize-contrast', ...props.style }} />;
  return progressiveLoading ? (
    <ProgressiveImage src={props.src} placeholder={''}>
      {(src: string, loading: boolean) => {
        return loading ? <div>Loading...</div> : <ImgElement />;
      }}
    </ProgressiveImage>
  ) : (
    <ImgElement />
  );
};

export default OptimizedImage;
