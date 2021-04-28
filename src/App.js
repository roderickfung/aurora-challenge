import * as React from "react";
import { jsPlumb } from "jsplumb";
import styled from "styled-components";
import Label from "./components/Label";
import { renderNode } from "./components/Node";
import "./App.css";

const { useEffect, useState } = React;

jsPlumb.importDefaults({
  connector: ["Bezier", { curviness: 80 }],
  anchors: ["TopCenter", "BottomCenter"],
  endpoint: ["Dot", { radius: 5 }],
});

export const Wrapper = styled.section`
  width: 100vw;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ButtonWrapper = styled.article`
  display: flex;
  flex-direction: row;
  & > button {
    :nth-child(n + 2) {
      margin-left: 5px;
    }
  }
`;

export const ItemWrapper = styled.div`
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

export const ChildrenWrapper = styled.div`
  padding: 60px 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Button = styled.button`
  min-height: 28px;
  padding: 6px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: 2px solid lightslategray;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #ccc;
  }
`;

// Notes: Transforming from 1 tree structure to add children into its node, this way I can check within the Node Component that if it has children, render the children, making it easy to build the tree structure

//^ I would have found out earlier if I was working on this with the developers, but because I didn't, I've found out my approach wasn't correct (due to how the data was structured) but I've already commited to my original approach, thus I had to completely change my approach until I found out much later (~ 1hr)

// ALSO NOTE: would have made this into a recursive function to push the combined voltage up for multi-level tree node

const buildTree = (nodes) =>
  nodes.map((node) => {
    const children = nodes.filter((nd) => nd.connected_to_id === node.id);
    const updated = children.map((child) => ({
      ...child,
      children: nodes.filter((nd) => nd.connected_to_id === child.id),
    }));

    return {
      ...node,
      combinedV:
        updated.length > 0
          ? children.reduce((acc, cur) => {
              return acc + cur.power_rating;
            }, 0)
          : null,
      children: updated,
    };
  });

const App = () => {
  const [loading, setLoading] = useState(false);
  const [base, setBase] = useState(null);
  const [designs, setDesigns] = useState(null);
  const [details, setDetails] = useState([]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://aurorasolar-simple-server.herokuapp.com/api/designs"
      );
      const data = await response.json();
      setDesigns(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const response = await fetch(
        `http://aurorasolar-simple-server.herokuapp.com/api/components?design_id=${id}`
      );
      const { components } = await response.json();
      const base = components.find((item) => item.connected_to_id === null);
      const updated = buildTree(components);
      console.log(updated);
      const children = updated.filter((item) => item.connected_to_id !== null);
      setBase(base);
      setDetails(children);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // Notes: This works if we put an explicit string, but doesn't seem to work if I put a variable in there. I haven't been given any information on how EXACTLY this function works.

  // useEffect(() => {
  //   if (details.length > 0) {
  //     details.map((item) => {
  //       jsPlumb.connect({
  //         source: base.id,
  //         target: item.id,
  //       });
  //     });
  //   }
  // }, []);

  if (loading) {
    <Wrapper>
      <div>Loading...</div>
    </Wrapper>;
  }

  if (!designs) {
    return (
      <Wrapper>
        <div>There are no designs</div>
      </Wrapper>
    );
  }

  const total = details.reduce((acc, item) => acc + item.power_rating, 0);

  return (
    <Wrapper>
      <ButtonWrapper>
        {designs.map(({ id, name }) => (
          <Button id={id} onClick={() => fetchDetails(id)}>
            {name}
          </Button>
        ))}
      </ButtonWrapper>
      <ItemWrapper>
        {base && (
          <Label id={base.id} total={total}>
            {base.component_type.toUpperCase()}
          </Label>
        )}
        <ChildrenWrapper>
          {details.length > 0 &&
            renderNode({ parent: base, children: details })}
        </ChildrenWrapper>
      </ItemWrapper>
    </Wrapper>
  );
};

export default App;
