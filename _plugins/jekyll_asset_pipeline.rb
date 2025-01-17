Jekyll::Hooks.register :site, :after_init do |site|
  # Only run in development
  if Jekyll.env == "development"
    system "npm run watch &"
  end
end
