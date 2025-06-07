"use client";

import React from "react";

export default function Contact() {
  return (
    <section className="content h-screen flex flex-col">
      <h5 className="page-title">/ Contact</h5>
      <form>
        <div className="form-input">
          <label htmlFor="name">Full Name</label>
          <input type="text" />
        </div>
        <div className="form-input">
          <label htmlFor="name">Email address</label>
          <input type="email" />
        </div>
        <div className="form-input">
          <label htmlFor="message">Message</label>
          <textarea name="message"></textarea>
        </div>
      </form>
    </section>
  );
}
