import instaloader
import json

def get_metrics(username, password):
    # Create an instance of Instaloader with login credentials
    L = instaloader.Instaloader()
    L.login(username, password)

    try:
        # Retrieve profile metadata
        profile = instaloader.Profile.from_username(L.context, username)

        # Initialize list to store post metrics
        post_metrics = []

        # Iterate over the posts and store the metrics in a dictionary
        for post in profile.get_posts():
            post_data = {
                "shortcode": post.shortcode,
                "typename": post.typename,
                "likes": post.likes,
                "comments": post.comments
            }
            if post.typename == 'GraphVideo':
                post_data["video_view_count"] = post.video_view_count
            post_metrics.append(post_data)

        # Write the list of post metrics into a JSON file
        with open('instagram_metrics.json', 'w') as json_file:
            json.dump(post_metrics, json_file, indent=4)

        print("Data saved successfully to 'instagram_metrics.json'.")

    except instaloader.exceptions.ProfileNotExistsException:
        print(f"Profile with username '{username}' does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Replace 'username' and 'password' with your Instagram credentials
get_metrics('openai_zs', 'insta123#')
