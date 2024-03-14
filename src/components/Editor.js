import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./editorStyles.css"; // Import CSS file for styling

const EditorComponent = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    } else {
      return EditorState.createEmpty();
    }
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const serializedContent = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("draftEditorContent", serializedContent);
  }, [editorState]);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 9 /* TAB key */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  const handleInputChange = (editorState) => {
    setEditorState(editorState);
  };

  const handleSave = () => {
    // Handle saving content
    console.log(
      "Content saved:",
      editorState.getCurrentContent().getPlainText()
    );
  };

  const inlineStyles = {
    "#": "header-one",
    "*": "BOLD",
    "**": "STRIKETHROUGH",
    "***": "UNDERLINE",
  };

  const handleBeforeInput = (char, editorState) => {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const startKey = selectionState.getStartKey();
    const block = contentState.getBlockForKey(startKey);
    const text = block.getText();
  
    for (const [marker, style] of Object.entries(inlineStyles)) {
      if (text.startsWith(marker)) {
        const newContentState = RichUtils.toggleInlineStyle(
          editorState.getCurrentContent(),
          style
        );
        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "change-inline-style"
        );
        setEditorState(newEditorState);
        return "handled";
      }
    }
  
    return "not-handled";
  };

  return (
    <div>
      <div className="editor">
        <div className="editor-title">
          <h2>Demo Editor by Sneha Singh</h2>
        </div>
        <div className="editor-button">
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={mapKeyToEditorCommand}
          onChange={handleInputChange}
          handleBeforeInput={handleBeforeInput}
        />
      </div>
    </div>
  );
};

export default EditorComponent;
