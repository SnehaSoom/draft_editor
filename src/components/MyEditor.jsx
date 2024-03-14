import React from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier, getDefaultKeyBinding } from 'draft-js';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };

    // Check if there's a saved state in localStorage
    const savedData = localStorage.getItem('editorState');
    if (savedData) {
      const loadedState = convertFromRaw(JSON.parse(savedData));
      this.state = { editorState: EditorState.createWithContent(loadedState) };
    }

    this.onChange = (editorState) => {
      const contentState = editorState.getCurrentContent();
      // Save the state to localStorage
      localStorage.setItem('editorState', JSON.stringify(convertToRaw(contentState)));
      this.setState({ editorState });
    };
  }

  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  myKeyBindingFn = (e) => {
    if (e.keyCode === 32 /* `SPACE` key */) {
      const currentContent = this.state.editorState.getCurrentContent();
      const selection = this.state.editorState.getSelection();
      const key = selection.getStartKey();
      const text = currentContent.getBlockForKey(key).getText();
      const type = this.getBlockTypeForMarkdown(text);
      if (type) {
        this.onChange(RichUtils.toggleBlockType(this.state.editorState, type));
        return;
      }
    }
    return getDefaultKeyBinding(e);
  }

  getBlockTypeForMarkdown = (text) => {
    switch (text) {
      case '#': return 'header-one';
      case '*': return 'BOLD';
      case '**': return 'red-line'; // You'll need to handle this in your blockStyleFn
      case '***': return 'UNDERLINE';
      default: return null;
    }
  }

  render() {
    return (
      <div className="myEditor">
        <h2>Title</h2>
        <button onClick={() => localStorage.clear()}>Save</button>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand.bind(this)}
          onChange={this.onChange}
          keyBindingFn={this.myKeyBindingFn}
        />
      </div>
    );
  }
}

export default MyEditor;
