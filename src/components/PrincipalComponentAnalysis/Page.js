// @flow
import React from 'react';
import type { Node } from 'react';
import styled, { css } from 'styled-components';
import { Times } from 'styled-icons/fa-solid/Times';
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
  visualize: boolean,
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
    visualize: false,
    calculating: false,
    calculated: false,
    uploading: false,
    uploaded: false,
    error: '', // todo: handle array
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
    this.setState(
      {
        uploaded: false,
        uploading: true,
      },
      this.clearErrorBox,
    );

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
    this.setState(
      {
        selectedFile: null,
        uploaded: false,
      },
      this.clearErrorBox,
    );
  };

  onVisualize = () => {
    this.setState({
      visualize: true,
    });
  };

  clearErrorBox() {
    console.log('cleared');

    this.setState({ error: '' });
  }

  render(): Node {
    const {
      uploading,
      uploaded,
      calculating,
      calculated,
      visualize,
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
        <ErrorBox hasError={error}>{error}</ErrorBox>
        {(() => {
          if (uploading || calculating) {
            return <div>loading...</div>;
          }

          if (visualize) {
            return (
              <>
                <Biplot
                  points={scatterPoints}
                  vectors={eigens.E.x}
                  names={names}
                  analysis={analysis}
                />
                <Bar
                  values={eigens.lambda.x}
                  names={names}
                  analysis={analysis}
                />
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
            // show dataset here
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
              {selectedFile && (
                <FilesList>
                  <FilesListElement>
                    <FilesListElementName>
                      {selectedFile.name}
                    </FilesListElementName>
                    <CancelIcon size={24} onClick={this.onFileCancel} />
                  </FilesListElement>
                </FilesList>
              )}
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
  background-color: #0061d5;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  transition: 200ms ease-in;

  &:hover {
    background-color: #0979ff;
  }

  ${props => props.disabled
    && css`
      background-color: #b3b3b3;

      &:hover {
        background-color: #b3b3b3;
        cursor: not-allowed;
      }
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

const FilesList = styled.ul`
  margin-top: 20px;
  margin-bottom: 20px;
  list-style-type: none;
  padding-left: 0;
`;

const FilesListElement = styled.li`
  display: flex;
  align-items: center;
`;

const FilesListElementName = styled.span`
  font-size: 18px;
  color: #151f26;
`;

const CancelIcon = styled(Times)`
  margin-left: 10px;
  color: red;
  cursor: pointer;
`;

const ErrorBox = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 300;
  color: red;
  ${props => (props.hasError
    ? css`
          display: block;
        `
    : css`
          display: none;
        `)}
`;
