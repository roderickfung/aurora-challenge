import * as React from "react";
import { jsPlumb } from "jsplumb";
import { ItemWrapper, ChildrenWrapper } from "../../App";
import Label from "../Label";

const { useEffect, useMemo } = React;

// jsPlumb.importDefaults({
//   connector: ["Bezier", { curviness: 80 }],
//   anchors: ["TopCenter", "BottomCenter"],
//   endpoint: ["Dot", { radius: 5 }],
// });

export const renderNode = ({ parent, children }) =>
  children.map((child) => (
    <Node key={child.id} parent={parent} current={child} items={children} />
  ));

const Node = ({ parent, current, items }) => {
  // Note: My Old Approach, I thought it was only getting 1 level of tree, and thus we would have to make a call on each node to check if the node itself have children

  // const fetchItems = async (id) => {
  //   try {
  //     const response = await fetch(
  //       `http://aurorasolar-simple-server.herokuapp.com/api/components?design_id=${item.id}`
  //     );
  //     const { components } = await response.json();
  //     setItems(components);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // useEffect(() => {
  //   fetchItems(item.id);
  // }, [item.id]);

  let powerRatings = null;

  const children = useMemo(() => {
    return items.filter((item) => item.id !== current.id);
  }, [items, current.id]);

  if (current.component_type === "inverter") {
    powerRatings =
      current.combinedV ||
      current.children.reduce((acc, child) => {
        if (child.component_type === "solar panel series") {
          return acc + child.power_rating;
        }
        return acc;
      }, 0);
  }

  // Notes: I tried both approach of having the parent and item id but it gives an error.

  console.log(parent.id, current.id);

  // useEffect(() => {
  //   jsPlumb.connect({
  //     source: parent.id,
  //     target: current.id,
  //   });
  // }, [current.id, parent.id]);

  if (!parent || !current || parent.id !== current.connected_to_id) return null;

  return (
    <ItemWrapper>
      <Label
        id={current.id}
        powerRatings={powerRatings}
        voltage={
          current.component_type === "solar panel series" &&
          current.output_voltage
        }
      >
        {current.component_type.toUpperCase()}
      </Label>
      <ChildrenWrapper>
        {children.length > 0 && renderNode({ parent: current, children })}
      </ChildrenWrapper>
    </ItemWrapper>
  );
};

export default Node;
