import type { AccordionItem as AccordionItemType } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

type AccordionProps = {
  data: AccordionItemType[];
};

export default function AccordionBlock({ data }: AccordionProps) {
  return (
    <Accordion type="single" collapsible>
      {data.map((item, index) => (
        <AccordionItem key={`accordion-item-${index}`} value={`item-${index}`}>
          <AccordionTrigger>{item.heading.content}</AccordionTrigger>
          <AccordionContent>{item.body.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
