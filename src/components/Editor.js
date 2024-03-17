import { useState } from "react";
import "./editorStyles.css";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  convertFromRaw,
  CompositeDecorator,
  Modifier,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const applyBlockStyle = (contentBlock) =>
  contentBlock.getType() === "code-block" ? "code-block-style" : "";

const RED_COLOR_STYLE = { color: "red" };

const highlightRedText = {
  strategy: (contentBlock, callback) =>
    contentBlock.findStyleRanges(
      (character) => character.hasStyle("RED_COLOR"),
      callback
    ),
  component: (props) => <span style={RED_COLOR_STYLE}>{props.children}</span>,
};

const editorDecorator = new CompositeDecorator([highlightRedText]);

const TextEditor = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("SavedContent");
    return savedContent
      ? EditorState.createWithContent(
          convertFromRaw(JSON.parse(savedContent)),
          editorDecorator
        )
      : EditorState.createEmpty(editorDecorator);
  });

  const handleEditorChange = (newEditorState) => {
    let contentState = newEditorState.getCurrentContent();
    const selectionState = newEditorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContentBlock = contentState.getBlockForKey(anchorKey);
    const start = selectionState.getStartOffset();
    const text = currentContentBlock.getText();

    // Function to apply block type and remove the marker
    const applyBlockTypeAndRemoveMarker = (blockType, marker) => {
      const markerLength = marker.length;
      const newSelection = selectionState.merge({
        anchorOffset: 0,
        focusOffset: markerLength,
      });

      // Remove the marker and apply the block type
      contentState = Modifier.removeRange(
        contentState,
        newSelection,
        "backward"
      );
      const newContentState = Modifier.setBlockType(
        contentState,
        newSelection,
        blockType
      );
      return EditorState.push(
        newEditorState,
        newContentState,
        "change-block-type"
      );
    };

    // Check for markers followed by a space
    if (text.startsWith("# ") && start === 2) {
      setEditorState(applyBlockTypeAndRemoveMarker("header-one", "#"));
    } else if (text.startsWith("* ") && start === 2) {
      setEditorState(applyBlockTypeAndRemoveMarker("unstyled", "*"));
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "BOLD"));
    } else if (text.startsWith("** ") && start === 3) {
      setEditorState(applyBlockTypeAndRemoveMarker("unstyled", "**"));
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "RED_COLOR"));
    } else if (text.startsWith("*** ") && start === 4) {
      setEditorState(applyBlockTypeAndRemoveMarker("unstyled", "***"));
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE"));
    } else {
      setEditorState(newEditorState);
    }

    // Save to local storage
    localStorage.setItem(
      "SavedContent",
      JSON.stringify(convertToRaw(newEditorState.getCurrentContent()))
    );
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title-container">
          <h3>Demo editor by Sneha Singh</h3>
        </div>
        <button
          onClick={() => setIsSaving(!isSaving)}
          className="save-button"
          disabled={isSaving}
        >
          {isSaving ? "SAVED" : "SAVE"}
        </button>
      </div>
      <div className="editor-border">
        <Editor
          editorState={editorState}
          handleKeyCommand={(command, state) =>
            RichUtils.handleKeyCommand(state, command)
              ? "handled"
              : "not-handled"
          }
          keyBindingFn={getDefaultKeyBinding}
          handlePastedText={(text, state) => handleEditorChange(state)}
          onChange={handleEditorChange}
          blockStyleFn={applyBlockStyle}
        />
      </div>
    </div>
  );
};

export default TextEditor; 