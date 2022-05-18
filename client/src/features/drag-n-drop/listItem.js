import { Draggable } from "react-beautiful-dnd";
import React, { useMemo, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useParams, useHistory } from 'react-router-dom';
import Glyphicon from '@strongdm/glyphicon'

import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';




import { useDispatch } from 'react-redux';
import useCommon from "../hooks/useCommon";

import {
  deleteWiki,
} from '../wiki/wiki-reducer';



const CardHeader = styled.div`
  font-weight: 500;
`;

const DragItem = styled.div`
  position: relative;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  background: white;
  margin: 0 0 8px 0;
  display: flex;
  &:hover .drag-item-btn{
      background-color: lightgrey;
      color: white;
  }
`;


const ListItem = ({ item, index, setCurrentWikiId }) => {

  const history = useHistory();
  const dispatch = useDispatch();
  const { ens } = useParams();
  const { authenticated_post } = useCommon()

  const header = item.title;

  const [isWikiEllipsesClicked, setIsWikiEllipsesClicked] = useState(false)

  const handleDeleteEllipsesClick = (e) => {
    setIsWikiEllipsesClicked(!isWikiEllipsesClicked)
    e.stopPropagation();
  }

  const handleDelete = async (e) => {
    e.stopPropagation();
    let res = await authenticated_post('/wiki/deleteWiki/', { ens: ens, file_id: item.id });
    console.log(res)
    if (res) {
      dispatch(deleteWiki(item.grouping, index))
    }

  }

  const focusInCurrentTarget = ({ relatedTarget, currentTarget }) => {
    if (relatedTarget === null) return false;

    var node = relatedTarget.parentNode;

    while (node !== null) {
      if (node === currentTarget) return true;
      node = node.parentNode;
    }

    return false;
  }


  const onBlur = (e) => {
    if (!focusInCurrentTarget(e)) {
      setIsWikiEllipsesClicked(false)
    }
  }


  return (
    <>
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => {
          return (
            <DragItem
              ref={provided.innerRef}
              snapshot={snapshot}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              index={index}
              onClick={() => setCurrentWikiId(item.id)}
            >
              <CardHeader>{header}</CardHeader>
              <button className={'drag-item-btn ' + (isWikiEllipsesClicked ? 'focus' : undefined)} onClick={handleDeleteEllipsesClick} onBlur={onBlur}>
                <i className="fas fa-ellipsis-h"></i>
              </button>
              <div className={"dropdown " + (!isWikiEllipsesClicked ? 'hidden' : undefined)}>
                <p onClick={handleDelete} >delete</p>
              </div>
            </DragItem>
          );
        }}
      </Draggable>
    </>
  );
};

export default ListItem;
