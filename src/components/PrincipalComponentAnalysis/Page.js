// @flow
import React from 'react';
import type { Node } from 'react';
import styled, { css } from 'styled-components';
// import web workers
import CalculateWorker from './calculate.worker';
import UploadWorker from './upload.worker';
// imports charts
import Bar from './Bar';
import Biplot from './Biplot';

type Props = {};

type State = {
  selectedFile: File,
  dataset: Array<number[]>,
  calculations: {
    scatterPoints: Array<{
      x: number,
      y: number,
    }>,
    adjustedDataset: Array<number[]>,
    covariance: Array<number[]>,
    eigens: {
      lambda: {
        x: Array<number[]>,
        y: Array<number[]>,
      },
      E: {
        x: Array<number>,
        y: Array<number>,
      },
    },
    linearCombinations: Array<number[]>,
    names: Array<string>,
  },
  plotting: boolean,
  plotted: boolean,
  calculating: boolean,
  calculated: boolean,
  uploading: boolean,
  uploaded: boolean,
  error: string,
};

export default class Page extends React.Component<Props, State> {
  state = {
    selectedFile: null,
    dataset: [],
    calculations: {
      scatterPoints: [],
      adjustedDataset: [],
      covariance: [],
      eigens: {},
      linearCombinations: [],
    },
    plotting: false,
    plotted: false,
    calculating: false,
    calculated: false,
    uploading: false,
    uploaded: false,
    error: '',
  };

  fileInput: ?HTMLInputElement = React.createRef();

  componentDidMount() {
    this.initializeWebWorkers();
  }

  initializeWebWorkers() {
    this.calculateWorker = new CalculateWorker();
    this.uploadWorker = new UploadWorker();
  }

  onCalculate = (e: Event): void => {
    const { dataset }: Array<number[]> = this.state;

    this.setState({
      calculating: true,
      calculated: false,
    });

    // communication with worker
    this.calculateWorker.addEventListener(
      'message',
      (ev) => {
        const { data } = ev;

        this.setState({
          calculating: false,
          calculated: true,
          calculations: data,
        });
      },
      false,
    );

    // error handler
    this.calculateWorker.addEventListener('error', (event: ErrorEvent) => {
      this.setState({
        uploaded: false,
        uploading: false,
        error: event.message,
      });
    });

    // TODO: add timeout function (stop calculations if too long)
    // send the dataset to the worker
    this.calculateWorker.postMessage(dataset);
  };

  onFileSelectInputChange = (e: Event): void => {
    const { files }: FileList = event.target;
    const [file]: File = files;

    // reset input
    // to be able to upload the same file again if it was canceled
    event.target.value = ''; // eslint-disable-line

    this.setState({
      selectedFile: file,
    });
  };

  onFileUpload = (e: Event): void => {
    this.setState({
      error: '',
      uploaded: false,
      uploading: true,
    });

    const { selectedFile } = this.state;

    // communication with worker
    this.uploadWorker.addEventListener(
      'message',
      (event: MessageEvent) => {
        this.setState({
          uploaded: true,
          uploading: false,
          dataset: event.data,
        });
      },
      false,
    );

    // error handler
    this.uploadWorker.addEventListener('error', (event: ErrorEvent) => {
      this.setState({
        uploaded: false,
        uploading: false,
        error: event.message,
      });
    });

    // send selected file to the worker
    this.uploadWorker.postMessage(selectedFile);
  };

  onFileCancel = () => {
    this.setState({
      selectedFile: null,
      uploaded: false,
      error: '',
    });
  };

  onVisualize = () => {
    this.setState({
      plotted: true,
    });
  };

  render(): Node {
    const {
      uploading,
      uploaded,
      calculating,
      calculated,
      plotting,
      plotted,
      selectedFile,
      dataset,
      calculations,
      error,
    } = this.state;
    const {
      scatterPoints, eigens, names, analysis,
    } = calculations;

    return (
      <Wrapper>
        <Title>Principal Component Analysis</Title>
        <Description>
          Principal component analysis (PCA) is a statistical procedure that
          uses an orthogonal transformation to convert a set of observations of
          possibly correlated variables (entities each of which takes on various
          numerical values) into a set of values of linearly uncorrelated
          variables called principal components.
        </Description>
        {(() => {
          if (plotted) {
            return (
              <>
                <Biplot
                  points={scatterPoints}
                  vectors={eigens.E.x}
                  names={names}
                  analysis={analysis}
                />
                <Bar values={eigens.lambda.x} names={names} analysis={analysis} />
              </>
            );
          }

          if (calculated) {
            return (
              <ButtonsGroup>
                <VisualizeButton onClick={this.onVisualize}>
                  Visualize
                </VisualizeButton>
              </ButtonsGroup>
            );
          }

          if (uploaded) {
            return (
              <ButtonsGroup>
                <CalculateButton onClick={this.onCalculate}>
                  Calculate
                </CalculateButton>
              </ButtonsGroup>
            );
          }

          return (
            <ButtonsGroup>
              <UploadInput
                ref={this.fileInput}
                onChange={this.onFileSelectInputChange}
              />
              <ChooseButton onClick={() => this.fileInput.current.click()}>
                Choose a file
              </ChooseButton>
              <UploadButton
                onClick={this.onFileUpload}
                disabled={!selectedFile}
              >
                Upload
              </UploadButton>
            </ButtonsGroup>
          );
        })()}
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
`;

const Title = styled.h1`
  margin-top: 16px;
  margin-bottom: 16px;
  font-size: 36px;
  font-style: normal;
  font-weight: 300;
  line-height: 1.5;
  color: #151f26;
`;

const Description = styled.p`
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 16px;
  letter-spacing: 0.2px;
  line-height: 1.5;
  color: #72848e;
`;

const btn = css`
  max-width: 160px;
  border: 0;
  border-radius: 5px;
  outline: none;
  padding: 12px 25px;
  text-transform: uppercase;
  background-color: #0979ff;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  ${props => props.disabled
    && css`
      background-color: #b3b3b3;
    `}
`;

const UploadInput = styled.input.attrs({
  type: 'file',
  multiple: false,
  hidden: true,
})`
  display: none;
  visibility: hidden;
`;

const ChooseButton = styled.button`
  ${btn}
  margin-right: 16px;
`;

const UploadButton = styled.button`
  ${btn}
`;

const CalculateButton = styled.button`
  ${btn}
  margin-right: 16px;
`;

const VisualizeButton = styled.button`
  ${btn}
`;

const ButtonsGroup = styled.div`
  margin-top: 16px;
  margin-bottm: 16px;
`;
